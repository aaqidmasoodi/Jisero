class SocketHandlers {
  constructor(translationService, database) {
    this.translationService = translationService;
    this.database = database;
    this.connectedUsers = new Map(); // socketId -> userData
    this.userSockets = new Map(); // userId -> socketId
    this.messageQueue = new Map(); // userId -> messages[]
  }

  handleConnection(socket) {
    console.log('User connected:', socket.id);

    // Handle user joining with their data
    socket.on('user-join', async (userData) => {
      console.log('User joined:', userData);
      
      try {
        // Update user online status in database
        await this.database.updateUserOnlineStatus(userData.userId, true);
        
        // Store user data
        this.connectedUsers.set(socket.id, userData);
        
        if (userData.userId) {
          // Map userId to socketId for direct messaging
          this.userSockets.set(userData.userId, socket.id);
          
          // Broadcast to ALL other users that this user is online
          socket.broadcast.emit('user-online', {
            userId: userData.userId,
            username: userData.username,
            avatar: userData.avatar
          });
          
          console.log(`Broadcasting ${userData.userId} is online to all users`);
          
          // Send list of currently online users to the new user
          const onlineUsers = Array.from(this.connectedUsers.values())
            .filter(user => user.userId && user.userId !== userData.userId);
          socket.emit('online-users', onlineUsers);
          
          // Also send individual online events for each currently online user
          onlineUsers.forEach(user => {
            socket.emit('user-online', {
              userId: user.userId,
              username: user.username,
              avatar: user.avatar
            });
          });
          
          // Process any queued messages for this user
          this.processQueuedMessages(userData.userId, socket);
        }
        
        socket.emit('user-joined', { success: true, socketId: socket.id });
      } catch (error) {
        console.error('Error handling user join:', error);
        socket.emit('user-join-error', { error: 'Failed to join' });
      }
    });

    // Handle user discovery
    socket.on('find-user', async (userId) => {
      console.log('Finding user:', userId);
      
      try {
        // Check database for user
        const user = await this.database.findUser(userId);
        
        if (user) {
          // Check if user is currently online
          const isOnline = this.userSockets.has(userId);
          
          socket.emit('user-found', {
            userId: user.user_id,
            username: user.username,
            avatar: user.avatar,
            isOnline: isOnline
          });
        } else {
          socket.emit('user-not-found', userId);
        }
      } catch (error) {
        console.error('Error finding user:', error);
        socket.emit('user-not-found', userId);
      }
    });

    // Handle direct messages
    socket.on('send-message', (data) => {
      const { chatId, message, recipientUserId, senderUserId, timestamp } = data;
      console.log(`Message from ${senderUserId} to ${recipientUserId}`);
      
      // Validate message has text
      if (!message || !message.text || message.text.trim() === '') {
        console.error('Invalid message - no text content');
        return;
      }
      
      const recipientSocketId = this.userSockets.get(recipientUserId);
      
      if (recipientSocketId) {
        // Recipient is online, deliver immediately
        const recipientSocket = socket.to(recipientSocketId);
        recipientSocket.emit('message-received', {
          chatId,
          message: {
            text: message.text,
            id: message.id
          },
          senderUserId,
          timestamp,
          messageId: message.id || `msg_${Date.now()}`
        });
        
        console.log(`Message delivered to online user ${recipientUserId}`);
      } else {
        // Recipient is offline, queue the message
        console.log(`User ${recipientUserId} is offline, queuing message`);
        this.queueMessage(recipientUserId, {
          chatId,
          message: {
            text: message.text,
            id: message.id
          },
          senderUserId,
          timestamp,
          messageId: message.id || `msg_${Date.now()}`
        });
      }
    });

    // Handle message delivery confirmation
    socket.on('message-delivered', (data) => {
      const { messageId, chatId, recipientUserId } = data;
      console.log(`Message ${messageId} delivered to ${recipientUserId}`);
      
      // Find sender and notify them
      const senderData = this.connectedUsers.get(socket.id);
      if (senderData && senderData.userId) {
        // Could notify sender that message was delivered
        // For now, just log it
      }
    });

    // Handle translation requests
    socket.on('translate', async (data) => {
      try {
        const { text, targetLang, service } = data;
        const result = await this.translationService.translate(text, targetLang, service);
        socket.emit('translation-result', result);
      } catch (error) {
        socket.emit('translation-error', { error: error.message });
      }
    });

    // Handle language detection
    socket.on('detect-language', async (data) => {
      try {
        const { text, service } = data;
        const language = await this.translationService.detectLanguage(text, service);
        socket.emit('language-detected', { language });
      } catch (error) {
        socket.emit('language-detection-error', { error: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { recipientUserId, isTyping } = data;
      const recipientSocketId = this.userSockets.get(recipientUserId);
      
      if (recipientSocketId) {
        const senderData = this.connectedUsers.get(socket.id);
        socket.to(recipientSocketId).emit('user-typing', {
          userId: senderData?.userId,
          isTyping,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      const userData = this.connectedUsers.get(socket.id);
      
      if (userData && userData.userId) {
        try {
          // Update user offline status in database
          await this.database.updateUserOnlineStatus(userData.userId, false);
          
          // Remove from user mapping
          this.userSockets.delete(userData.userId);
          
          // Broadcast to ALL other users that this user went offline
          socket.broadcast.emit('user-offline', {
            userId: userData.userId,
            username: userData.username,
            avatar: userData.avatar
          });
          
          console.log(`Broadcasting ${userData.userId} is offline to all users`);
        } catch (error) {
          console.error('Error handling user disconnect:', error);
        }
      }
      
      // Remove from connected users
      this.connectedUsers.delete(socket.id);
    });
  }

  // Queue message for offline user
  queueMessage(userId, messageData) {
    // Validate message data before queuing
    if (!messageData.message || !messageData.message.text || messageData.message.text.trim() === '') {
      console.error('Cannot queue message - invalid text content');
      return;
    }
    
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }
    
    const queue = this.messageQueue.get(userId);
    queue.push({
      ...messageData,
      queuedAt: new Date().toISOString()
    });
    
    console.log(`Queued message for ${userId}: "${messageData.message.text}"`);
    
    // Limit queue size to prevent memory issues
    if (queue.length > 100) {
      queue.shift(); // Remove oldest message
    }
  }

  // Process queued messages when user comes online
  processQueuedMessages(userId, socket) {
    const queuedMessages = this.messageQueue.get(userId);
    
    if (!queuedMessages || queuedMessages.length === 0) {
      return;
    }
    
    console.log(`Delivering ${queuedMessages.length} queued messages to ${userId}`);
    
    // Send all queued messages
    queuedMessages.forEach(messageData => {
      // Validate message before sending
      if (messageData.message && messageData.message.text && messageData.message.text.trim() !== '') {
        socket.emit('message-received', messageData);
        console.log(`Delivered queued message: "${messageData.message.text}"`);
      } else {
        console.error('Skipping invalid queued message:', messageData);
      }
    });
    
    // Clear the queue
    this.messageQueue.delete(userId);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Get queued messages count for a user
  getQueuedMessagesCount(userId) {
    const queue = this.messageQueue.get(userId);
    return queue ? queue.length : 0;
  }
}

module.exports = SocketHandlers;
