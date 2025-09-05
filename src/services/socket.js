class SocketService {
  constructor(serverURL = 'http://localhost:3000') {
    this.serverURL = serverURL;
    this.socket = null;
    this.connected = false;
    this.eventHandlers = new Map();
    this.currentUser = null;
    this.onlineUsers = new Set();
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
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
      };
      document.head.appendChild(script);
    } else {
      this.initializeSocket(userData);
    }
  }

  initializeSocket(userData) {
    console.log('Initializing socket connection...');
    
    this.socket = io(this.serverURL, {
      // Safari-specific options
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log(`✅ ${this.isSafari ? 'Safari' : 'Chrome'} connected to server:`, this.socket.id);
      this.connected = true;
      this.socket.emit('user-join', userData);
      
      // Process any queued messages
      if (window.messageQueue && userData.userId) {
        window.messageQueue.processQueuedMessages(userData.userId, this);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error(`❌ ${this.isSafari ? 'Safari' : 'Chrome'} connection error:`, error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 ${this.isSafari ? 'Safari' : 'Chrome'} disconnected:`, reason);
      this.connected = false;
      this.onlineUsers.clear();
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
      this.onlineUsers = new Set(users.map(u => u.userId));
      console.log(`📋 ${this.isSafari ? 'Safari' : 'Chrome'} - Online users:`, Array.from(this.onlineUsers));
      
      // Update all chat statuses
      if (window.chatStorage) {
        users.forEach(user => {
          window.chatStorage.updateChatOnlineStatus(user.userId, true);
        });
      }
    });

    this.socket.on('user-joined', (data) => {
      console.log(`✅ ${this.isSafari ? 'Safari' : 'Chrome'} - User joined successfully:`, data);
    });

    // Message events
    this.socket.on('message-received', async (data) => {
      console.log(`📨 ${this.isSafari ? 'Safari' : 'Chrome'} - Message received:`, data);
      console.log('Message structure:', {
        chatId: data.chatId,
        message: data.message,
        messageText: data.message?.text,
        senderUserId: data.senderUserId,
        timestamp: data.timestamp
      });
      await this.handleIncomingMessage(data);
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

    // Set up event handlers
    this.eventHandlers.forEach((handler, event) => {
      this.socket.on(event, handler);
    });

    // Safari-specific: Force connection check
    if (this.isSafari) {
      setTimeout(() => {
        if (!this.connected) {
          console.warn('Safari connection timeout, retrying...');
          this.socket.disconnect();
          this.initializeSocket(userData);
        }
      }, 5000);
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
    }
  }

  // Check if user is online
  isUserOnline(userId) {
    const isOnline = this.onlineUsers.has(userId);
    console.log(`❓ ${this.isSafari ? 'Safari' : 'Chrome'} - Is ${userId} online?`, isOnline);
    return isOnline;
  }

  // Send message
  sendMessage(chatId, message, recipientUserId) {
    if (!this.connected) {
      console.error('Not connected to server');
      return false;
    }

    const messageData = {
      chatId,
      message,
      recipientUserId,
      senderUserId: this.currentUser?.userId,
      timestamp: new Date().toISOString()
    };

    console.log(`📤 ${this.isSafari ? 'Safari' : 'Chrome'} - Sending message to ${recipientUserId}`);

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
      
      // Get user's preferred language
      const preferredLang = localStorage.getItem('user_preferred_language') || 'en';
      
      // Auto-translate the incoming message
      let translatedText = message.text;
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
        this.socket.emit('message-delivered', {
          messageId: data.messageId,
          chatId: chat.id,
          recipientUserId: this.currentUser?.userId
        });
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
      
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
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
