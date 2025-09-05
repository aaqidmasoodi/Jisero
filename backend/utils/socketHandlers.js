class SocketHandlers {
  constructor(translationService, database) {
    this.translationService = translationService;
    this.database = database;
    this.connectedUsers = new Map(); // userId -> socket mapping
    this.userSockets = new Map(); // socketId -> userId mapping
  }

  handleConnection(socket) {
    console.log(`🔌 New connection: ${socket.id}`);

    // User join with error handling
    socket.on('user-join', async (userData) => {
      try {
        console.log(`👤 User joining:`, userData);
        
        if (!userData || !userData.userId) {
          socket.emit('error', { message: 'Invalid user data' });
          return;
        }

        const { userId, username, avatar } = userData;
        
        // Store user connection
        this.connectedUsers.set(userId, socket);
        this.userSockets.set(socket.id, userId);
        
        // Update user online status in database
        await this.database.updateUserOnlineStatus(userId, true);
        
        // Join user to their personal room
        socket.join(userId);
        
        // Notify other users that this user is online
        socket.broadcast.emit('user-online', { userId, username, avatar });
        
        // Send current online users to the new user
        const onlineUsers = await this.database.getAllOnlineUsers();
        socket.emit('online-users', onlineUsers);
        
        // Deliver any undelivered messages
        await this.deliverPendingMessages(userId, socket);
        
        socket.emit('user-joined', { userId, status: 'connected' });
        
      } catch (error) {
        console.error('Error in user-join:', error);
        socket.emit('error', { message: 'Failed to join user' });
      }
    });

    // Message sending with persistence and error handling
    socket.on('send-message', async (data) => {
      try {
        console.log(`📤 Message received:`, data);
        
        if (!data || !data.message || !data.recipientUserId || !data.senderUserId) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const { chatId, message, recipientUserId, senderUserId, timestamp } = data;
        const messageId = message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        // Find or create chat
        const chat = await this.database.findOrCreateChat(senderUserId, recipientUserId);
        const finalChatId = chatId || chat.chat_id;
        
        // Get recipient's preferred language for translation
        const recipient = await this.database.findUser(recipientUserId);
        const targetLang = recipient?.preferred_language || 'en';
        
        // Translate message if needed
        let translatedText = message.text;
        let originalText = message.text;
        
        try {
          if (this.translationService && message.text.trim()) {
            const result = await this.translationService.translate(message.text, targetLang);
            translatedText = result.translatedText || message.text;
          }
        } catch (translationError) {
          console.error('Translation failed:', translationError);
          // Continue with original text if translation fails
        }
        
        // Save message to database with deduplication
        console.log(`💾 Saving message to database: ${messageId}`);
        try {
          const savedMessage = await this.database.saveMessage({
            messageId,
            chatId: finalChatId,
            senderUserId,
            recipientUserId,
            messageText: translatedText,
            originalText,
            translatedText
          });
          
          console.log(`💾 Message saved result:`, savedMessage);
          
          if (!savedMessage.inserted) {
            console.log(`Message ${messageId} already exists, skipping`);
            return;
          }
        } catch (error) {
          console.error(`❌ Error saving message ${messageId}:`, error);
          return;
        }
        
        // Send delivery confirmation to sender
        socket.emit('message-delivered', { messageId, chatId: finalChatId });
        
        // Try to deliver to recipient if online
        const recipientSocket = this.connectedUsers.get(recipientUserId);
        if (recipientSocket) {
          recipientSocket.emit('message-received', {
            messageId,
            chatId: finalChatId,
            message: {
              id: messageId,
              text: translatedText,
              originalText
            },
            senderUserId,
            timestamp: timestamp || new Date().toISOString()
          });
          
          // Update message status to delivered
          await this.database.updateMessageStatus(messageId, 'delivered', new Date().toISOString());
        } else {
          // Recipient is offline, message will be delivered when they come online
          console.log(`Recipient ${recipientUserId} is offline, message queued`);
          await this.database.updateMessageStatus(messageId, 'queued');
        }
        
      } catch (error) {
        console.error('Error in send-message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Message delivery confirmation
    socket.on('message-delivered', async (data) => {
      try {
        const { messageId, chatId, recipientUserId } = data;
        
        if (messageId) {
          await this.database.updateMessageStatus(messageId, 'delivered', new Date().toISOString());
          
          // Notify sender about delivery
          const message = await this.database.db.get('SELECT sender_user_id FROM messages WHERE message_id = ?', [messageId]);
          if (message) {
            const senderSocket = this.connectedUsers.get(message.sender_user_id);
            if (senderSocket) {
              senderSocket.emit('message-delivered', { messageId, chatId });
            }
          }
        }
      } catch (error) {
        console.error('Error in message-delivered:', error);
      }
    });

    // Message seen confirmation
    socket.on('message-seen', async (data) => {
      try {
        const { messageId, chatId, recipientUserId } = data;
        console.log(`👁️ Message seen confirmation: ${messageId} from recipient: ${recipientUserId}`);
        
        if (messageId) {
          // First, let's check if the message exists with proper promise handling
          try {
            const checkMessage = await new Promise((resolve, reject) => {
              this.database.db.get('SELECT * FROM messages WHERE message_id = ?', [messageId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
            console.log(`👁️ Full message data:`, checkMessage);
            
            if (checkMessage) {
              await this.database.updateMessageStatus(messageId, 'seen', new Date().toISOString());
              
              const senderSocket = this.connectedUsers.get(checkMessage.sender_user_id);
              if (senderSocket) {
                console.log(`👁️ Forwarding message-seen to sender: ${checkMessage.sender_user_id}`);
                senderSocket.emit('message-seen', { messageId, chatId });
              } else {
                console.log(`❌ Sender ${checkMessage.sender_user_id} not found in connected users`);
              }
            } else {
              console.log(`❌ Message ${messageId} not found in database`);
            }
          } catch (dbError) {
            console.error(`❌ Database query error:`, dbError);
          }
        }
      } catch (error) {
        console.error('Error in message-seen:', error);
      }
    });

    // User discovery
    socket.on('find-user', async (userId) => {
      try {
        console.log(`🔍 Finding user: ${userId}`);
        
        if (!userId) {
          socket.emit('user-not-found', userId);
          return;
        }
        
        const user = await this.database.findUser(userId);
        
        if (user) {
          socket.emit('user-found', {
            userId: user.user_id,
            username: user.username,
            avatar: user.avatar,
            isOnline: this.connectedUsers.has(user.user_id)
          });
        } else {
          socket.emit('user-not-found', userId);
        }
      } catch (error) {
        console.error('Error in find-user:', error);
        socket.emit('user-not-found', userId);
      }
    });

    // Translation requests
    socket.on('translate', async (data) => {
      try {
        const { text, targetLang, service } = data;
        
        if (!text || !targetLang) {
          socket.emit('translation-error', { error: 'Missing text or target language' });
          return;
        }
        
        const result = await this.translationService.translate(text, targetLang, service);
        socket.emit('translation-result', result);
      } catch (error) {
        console.error('Translation error:', error);
        socket.emit('translation-error', { error: error.message });
      }
    });

    // Language detection
    socket.on('detect-language', async (data) => {
      try {
        const { text, service } = data;
        
        if (!text) {
          socket.emit('language-detection-error', { error: 'Missing text' });
          return;
        }
        
        const language = await this.translationService.detectLanguage(text, service);
        socket.emit('language-detected', { language });
      } catch (error) {
        console.error('Language detection error:', error);
        socket.emit('language-detection-error', { error: error.message });
      }
    });

    // Delete chat
    socket.on('delete-chat', async (data) => {
      try {
        const { chatId, recipientUserId, senderUserId } = data;
        console.log(`🗑️ Deleting chat: ${chatId}`);
        
        // Notify the other user that the chat was deleted
        const recipientSocket = connectedUsers.get(recipientUserId);
        if (recipientSocket) {
          recipientSocket.emit('chat-deleted', { chatId });
        }
      } catch (error) {
        console.error('Delete chat error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        console.log(`🔌 User disconnected: ${socket.id}`);
        
        const userId = this.userSockets.get(socket.id);
        if (userId) {
          // Update user offline status
          await this.database.updateUserOnlineStatus(userId, false);
          
          // Remove from connected users
          this.connectedUsers.delete(userId);
          this.userSockets.delete(socket.id);
          
          // Notify other users that this user went offline
          socket.broadcast.emit('user-offline', { userId });
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  }

  // Deliver pending messages when user comes online
  async deliverPendingMessages(userId, socket) {
    try {
      const undeliveredMessages = await this.database.getUndeliveredMessages(userId);
      
      for (const msg of undeliveredMessages) {
        socket.emit('message-received', {
          messageId: msg.message_id,
          chatId: msg.chat_id,
          message: {
            id: msg.message_id,
            text: msg.message_text,
            originalText: msg.original_text
          },
          senderUserId: msg.sender_user_id,
          timestamp: msg.created_at
        });
        
        // Update message status to delivered
        await this.database.updateMessageStatus(msg.message_id, 'delivered', new Date().toISOString());
      }
      
      if (undeliveredMessages.length > 0) {
        console.log(`📬 Delivered ${undeliveredMessages.length} pending messages to ${userId}`);
      }
    } catch (error) {
      console.error('Error delivering pending messages:', error);
    }
  }
}

module.exports = SocketHandlers;
