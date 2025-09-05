class SocketService {
  constructor(serverURL = 'http://localhost:3000') {
    this.serverURL = serverURL;
    this.socket = null;
    this.connected = false;
    this.eventHandlers = new Map();
    this.currentUser = null;
    this.onlineUsers = new Set();
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageBuffer = [];
  }

  connect(userData = {}) {
    if (this.socket) {
      this.disconnect();
    }

    this.currentUser = userData;
    console.log(`Connecting from ${this.isSafari ? 'Safari' : 'Chrome'} with user:`, userData);

    // Load Socket.IO from CDN
    if (!window.io) {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
      script.onload = () => {
        this.initializeSocket(userData);
      };
      script.onerror = () => {
        console.error('Failed to load Socket.IO script');
        this.handleConnectionError('Failed to load Socket.IO');
      };
      document.head.appendChild(script);
    } else {
      this.initializeSocket(userData);
    }
  }

  initializeSocket(userData) {
    console.log('Initializing socket connection...');
    
    this.socket = io(this.serverURL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventHandlers(userData);
  }

  setupEventHandlers(userData) {
    this.socket.on('connect', () => {
      console.log(`✅ ${this.isSafari ? 'Safari' : 'Chrome'} connected to server:`, this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      
      // Join with user data
      this.socket.emit('user-join', userData);
      
      // Process any buffered messages
      this.processBufferedMessages();
      
      // Process any queued messages
      if (window.messageQueue && userData.userId) {
        window.messageQueue.processQueuedMessages(userData.userId, this);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error(`❌ ${this.isSafari ? 'Safari' : 'Chrome'} connection error:`, error);
      this.handleConnectionError(error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 ${this.isSafari ? 'Safari' : 'Chrome'} disconnected:`, reason);
      this.connected = false;
      this.onlineUsers.clear();
      
      // Attempt reconnection if not intentional
      if (reason !== 'io client disconnect') {
        this.attemptReconnection(userData);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error(`🔄❌ Reconnection failed:`, error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔄❌ All reconnection attempts failed');
      this.handleConnectionError('Reconnection failed');
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error(`Socket error:`, error);
      this.emit('error', error);
    });

    // User discovery events
    this.socket.on('user-online', (user) => {
      console.log(`🟢 ${this.isSafari ? 'Safari' : 'Chrome'} - User came online:`, user.userId);
      this.onlineUsers.add(user.userId);
      
      // Update chat storage
      if (window.chatStorage) {
        window.chatStorage.updateChatOnlineStatus(user.userId, true);
        console.log(`Updated ${user.userId} status to ONLINE in storage`);
      }
      
      // Process queued messages for this user
      if (window.messageQueue) {
        window.messageQueue.processQueuedMessages(user.userId, this);
      }
    });

    this.socket.on('user-offline', (user) => {
      console.log(`🔴 ${this.isSafari ? 'Safari' : 'Chrome'} - User went offline:`, user.userId);
      this.onlineUsers.delete(user.userId);
      
      // Update chat storage
      if (window.chatStorage) {
        window.chatStorage.updateChatOnlineStatus(user.userId, false);
        console.log(`Updated ${user.userId} status to OFFLINE in storage`);
      }
    });

    this.socket.on('online-users', (users) => {
      this.onlineUsers = new Set(users.map(u => u.userId || u.user_id));
      console.log(`📋 ${this.isSafari ? 'Safari' : 'Chrome'} - Online users:`, Array.from(this.onlineUsers));
      
      // Update all chat statuses
      if (window.chatStorage) {
        users.forEach(user => {
          const userId = user.userId || user.user_id;
          window.chatStorage.updateChatOnlineStatus(userId, true);
        });
      }
    });

    this.socket.on('user-joined', (data) => {
      console.log(`✅ ${this.isSafari ? 'Safari' : 'Chrome'} - User joined successfully:`, data);
    });

    // Message events with error handling
    this.socket.on('message-received', async (data) => {
      try {
        console.log(`📨 ${this.isSafari ? 'Safari' : 'Chrome'} - Message received:`, data);
        await this.handleIncomingMessage(data);
      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    });

    this.socket.on('message-delivered', (data) => {
      console.log(`✅ ${this.isSafari ? 'Safari' : 'Chrome'} - Message delivered:`, data.messageId);
      if (window.chatStorage) {
        window.chatStorage.updateMessageStatus(data.chatId, data.messageId, 'delivered');
      }
    });

    this.socket.on('user-found', (userData) => {
      console.log(`🔍 ${this.isSafari ? 'Safari' : 'Chrome'} - User found:`, userData);
      this.emit('user-found', userData);
    });

    this.socket.on('user-not-found', (userId) => {
      console.log(`❌ ${this.isSafari ? 'Safari' : 'Chrome'} - User not found:`, userId);
      this.emit('user-not-found', userId);
    });

    this.socket.on('chat-deleted', (data) => {
      console.log(`🗑️ Chat deleted:`, data.chatId);
      if (window.chatStorage) {
        window.chatStorage.deleteChat(data.chatId);
        window.dispatchEvent(new CustomEvent('chatListUpdate'));
      }
    });

    // Set up custom event handlers
    this.eventHandlers.forEach((handler, event) => {
      this.socket.on(event, handler);
    });
  }

  handleConnectionError(error) {
    console.error('Connection error:', error);
    this.emit('connection-error', error);
  }

  attemptReconnection(userData) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeSocket(userData);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.handleConnectionError('Max reconnection attempts reached');
    }
  }

  processBufferedMessages() {
    if (this.messageBuffer.length > 0) {
      console.log(`📤 Processing ${this.messageBuffer.length} buffered messages`);
      
      this.messageBuffer.forEach(messageData => {
        this.socket.emit('send-message', messageData);
      });
      
      this.messageBuffer = [];
    }
  }

  disconnect() {
    if (this.socket) {
      console.log(`🔌 ${this.isSafari ? 'Safari' : 'Chrome'} - Disconnecting...`);
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.onlineUsers.clear();
    }
  }

  // User discovery
  findUser(userId) {
    if (this.connected) {
      console.log(`🔍 ${this.isSafari ? 'Safari' : 'Chrome'} - Finding user:`, userId);
      this.socket.emit('find-user', userId);
    } else {
      console.error('Cannot find user - not connected to server');
      this.emit('user-not-found', userId);
    }
  }

  // Check if user is online
  isUserOnline(userId) {
    const isOnline = this.onlineUsers.has(userId);
    console.log(`❓ ${this.isSafari ? 'Safari' : 'Chrome'} - Is ${userId} online?`, isOnline);
    return isOnline;
  }

  // Send message with buffering for offline scenarios
  sendMessage(chatId, message, recipientUserId) {
    const messageData = {
      chatId,
      message,
      recipientUserId,
      senderUserId: this.currentUser?.userId,
      timestamp: new Date().toISOString()
    };

    console.log(`📤 ${this.isSafari ? 'Safari' : 'Chrome'} - Sending message to ${recipientUserId}`);

    if (!this.connected) {
      console.log('Not connected, buffering message');
      this.messageBuffer.push(messageData);
      return false;
    }

    // Check if recipient is online
    if (this.isUserOnline(recipientUserId)) {
      // Send directly
      this.socket.emit('send-message', messageData);
      return true;
    } else {
      // Queue message for offline user
      console.log(`User ${recipientUserId} is offline, queuing message`);
      if (window.messageQueue) {
        window.messageQueue.queueMessage(recipientUserId, {
          ...messageData,
          id: message.id
        });
      }
      
      // Still send to server for persistence
      this.socket.emit('send-message', messageData);
      
      // Still show as sent in UI, but mark as queued
      if (window.chatStorage) {
        window.chatStorage.updateMessageStatus(chatId, message.id, 'queued');
      }
      
      return false; // Indicates message was queued
    }
  }

  // Handle incoming messages with auto-translation
  async handleIncomingMessage(data) {
    const { chatId, message, senderUserId, timestamp } = data;
    
    try {
      // Validate message has text
      if (!message || !message.text || message.text.trim() === '') {
        console.error('Received message with no text:', data);
        return;
      }
      
      // Get user's preferred language and translation setting
      const preferredLang = localStorage.getItem('user_preferred_language') || 'en';
      const chatTranslationEnabled = localStorage.getItem('chat_translation_enabled') === 'true';
      
      // Auto-translate the incoming message (only if enabled)
      let translatedText = message.text;
      if (chatTranslationEnabled) {
        try {
          if (window.translationManager && message.text.trim() !== '') {
            const result = await window.translationManager.translate(message.text, preferredLang);
            translatedText = result.translatedText || message.text;
            console.log(`Auto-translated "${message.text}" to "${translatedText}"`);
          }
        } catch (error) {
          console.error('Auto-translation failed:', error);
          // Continue with original text if translation fails
          translatedText = message.text;
        }
      }
      
      // Find or create chat
      let chat = null;
      if (window.chatStorage) {
        const chats = window.chatStorage.getChats();
        chat = chats.find(c => c.userId === senderUserId);
        
        if (!chat) {
          // Create new chat for unknown sender
          chat = window.chatStorage.createChat(senderUserId, `User ${senderUserId.substring(0, 8)}`);
        }
        
        // Save the message with translation - ensure we have valid text
        const messageText = translatedText && translatedText.trim() !== '' ? translatedText : message.text;
        
        const savedMessage = window.chatStorage.saveMessage(chat.id, {
          text: messageText, // Save the translated text as the main text
          originalText: message.text, // Keep original for reference
          isOwn: false,
          timestamp: timestamp,
          senderUserId: senderUserId
        });
        
        // Send delivery confirmation
        if (this.connected) {
          this.socket.emit('message-delivered', {
            messageId: data.messageId,
            chatId: chat.id,
            recipientUserId: this.currentUser?.userId
          });
        }
      }
      
      // Emit event for UI updates
      this.emit('new-message', {
        chat,
        message: {
          text: translatedText && translatedText.trim() !== '' ? translatedText : message.text,
          originalText: message.text,
          isOwn: false,
          timestamp: timestamp,
          senderUserId: senderUserId
        }
      });

      // Trigger chat list update to show new/updated chat
      window.dispatchEvent(new CustomEvent('chatListUpdate'));
      
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  // Delete chat
  deleteChat(chatId, recipientUserId) {
    if (!this.connected) {
      console.log('Not connected, cannot delete chat');
      return false;
    }

    const deleteData = {
      chatId,
      recipientUserId,
      senderUserId: this.currentUser?.userId
    };

    this.socket.emit('delete-chat', deleteData);
    return true;
  }

  // Translation methods (keeping existing functionality)
  async translate(text, targetLang = 'en', service = null) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Translation timeout'));
      }, 10000);

      this.socket.once('translation-result', (result) => {
        clearTimeout(timeout);
        resolve(result);
      });

      this.socket.once('translation-error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.error));
      });

      this.socket.emit('translate', { text, targetLang, service });
    });
  }

  async detectLanguage(text, service = null) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Language detection timeout'));
      }, 5000);

      this.socket.once('language-detected', (result) => {
        clearTimeout(timeout);
        resolve(result.language);
      });

      this.socket.once('language-detection-error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.error));
      });

      this.socket.emit('detect-language', { text, service });
    });
  }

  // Event handling
  on(event, handler) {
    this.eventHandlers.set(event, handler);
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event) {
    this.eventHandlers.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    this.eventHandlers.forEach((handler, eventName) => {
      if (eventName === event) {
        handler(data);
      }
    });
  }
}

// Create global instance
window.socketService = new SocketService();
