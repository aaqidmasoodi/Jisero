class ChatStorageService {
  constructor() {
    this.storageKey = 'jisero_chats';
    this.userKey = 'jisero_user';
    this.messagesKey = 'jisero_messages';
  }

  // User management
  getCurrentUser() {
    try {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setCurrentUser(userData) {
    try {
      if (!userData || !userData.userId) {
        throw new Error('Invalid user data');
      }
      localStorage.setItem(this.userKey, JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  generateUserId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  // Chat management
  getChats() {
    try {
      const chats = localStorage.getItem(this.storageKey);
      return chats ? JSON.parse(chats) : [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  saveChats(chats) {
    try {
      if (!Array.isArray(chats)) {
        throw new Error('Chats must be an array');
      }
      localStorage.setItem(this.storageKey, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  createChat(userId, userName) {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId');
      }

      const chats = this.getChats();
      
      // Check for existing chat with this userId - PREVENT DUPLICATES
      const existingChatIndex = chats.findIndex(chat => chat.userId === userId);
      
      if (existingChatIndex !== -1) {
        // Update existing chat instead of creating duplicate
        chats[existingChatIndex].name = userName || chats[existingChatIndex].name;
        chats[existingChatIndex].timestamp = new Date().toISOString();
        this.saveChats(chats);
        return chats[existingChatIndex];
      }

      // Create new chat only if it doesn't exist
      const newChat = {
        id: `chat_${userId}_${Date.now()}`, // Include userId in chat ID for uniqueness
        userId: userId,
        name: userName || `User ${userId.substring(0, 8)}`,
        avatar: userId.substring(0, 2).toUpperCase(),
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unread: 0,
        isOnline: false,
        createdAt: new Date().toISOString()
      };

      chats.unshift(newChat);
      this.saveChats(chats);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }

  updateChatLastMessage(chatId, message, timestamp) {
    try {
      if (!chatId || !message) {
        return;
      }

      const chats = this.getChats();
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = message.substring(0, 100); // Limit message length
        chats[chatIndex].timestamp = this.formatTimestamp(timestamp);
        this.saveChats(chats);
      }
    } catch (error) {
      console.error('Error updating chat last message:', error);
    }
  }

  updateChatOnlineStatus(userId, isOnline) {
    try {
      if (!userId) {
        return;
      }

      const chats = this.getChats();
      let updated = false;
      
      // Update ALL chats with this userId (in case there are duplicates)
      chats.forEach(chat => {
        if (chat.userId === userId) {
          chat.isOnline = Boolean(isOnline);
          updated = true;
        }
      });
      
      if (updated) {
        this.saveChats(chats);
        console.log(`Updated online status for ${userId}: ${isOnline}`);
      }
    } catch (error) {
      console.error('Error updating chat online status:', error);
    }
  }

  // Remove duplicate chats (cleanup function)
  removeDuplicateChats() {
    try {
      const chats = this.getChats();
      const uniqueChats = [];
      const seenUserIds = new Set();
      
      chats.forEach(chat => {
        if (chat.userId && !seenUserIds.has(chat.userId)) {
          seenUserIds.add(chat.userId);
          uniqueChats.push(chat);
        } else {
          console.log(`Removing duplicate chat for user ${chat.userId}`);
        }
      });
      
      if (uniqueChats.length !== chats.length) {
        this.saveChats(uniqueChats);
        console.log(`Removed ${chats.length - uniqueChats.length} duplicate chats`);
      }
      
      return uniqueChats;
    } catch (error) {
      console.error('Error removing duplicate chats:', error);
      return this.getChats();
    }
  }

  // Message management
  getMessages(chatId) {
    try {
      if (!chatId) {
        return [];
      }

      const allMessages = localStorage.getItem(this.messagesKey);
      const messages = allMessages ? JSON.parse(allMessages) : {};
      return messages[chatId] || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  saveMessage(chatId, message) {
    try {
      if (!chatId || !message || !message.text) {
        throw new Error('Invalid message data');
      }

      // Sanitize message text
      const sanitizedText = message.text.trim().substring(0, 1000); // Limit message length
      if (!sanitizedText) {
        throw new Error('Empty message text');
      }

      const allMessages = localStorage.getItem(this.messagesKey);
      const messages = allMessages ? JSON.parse(allMessages) : {};
      
      if (!messages[chatId]) {
        messages[chatId] = [];
      }

      const messageWithId = {
        ...message,
        text: sanitizedText,
        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || 'sent' // sent, delivered, failed
      };

      // Check for duplicate messages
      const existingMessage = messages[chatId].find(msg => msg.id === messageWithId.id);
      if (existingMessage) {
        console.log(`Message ${messageWithId.id} already exists`);
        return existingMessage;
      }

      messages[chatId].push(messageWithId);
      localStorage.setItem(this.messagesKey, JSON.stringify(messages));
      
      // Update chat last message
      this.updateChatLastMessage(chatId, sanitizedText, messageWithId.timestamp);
      
      return messageWithId;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  updateMessageStatus(chatId, messageId, status) {
    try {
      if (!chatId || !messageId || !status) {
        return;
      }

      const allMessages = localStorage.getItem(this.messagesKey);
      const messages = allMessages ? JSON.parse(allMessages) : {};
      
      if (messages[chatId]) {
        const messageIndex = messages[chatId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          messages[chatId][messageIndex].status = status;
          localStorage.setItem(this.messagesKey, JSON.stringify(messages));
        }
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  // Utility functions
  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'now';
      }

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'now';
    }
  }

  // Clear all data (for testing)
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.messagesKey);
      localStorage.removeItem(this.userKey);
      console.log('All chat data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const chats = this.getChats();
      const allMessages = localStorage.getItem(this.messagesKey);
      const messages = allMessages ? JSON.parse(allMessages) : {};
      
      let totalMessages = 0;
      Object.keys(messages).forEach(chatId => {
        totalMessages += messages[chatId].length;
      });

      return {
        totalChats: chats.length,
        totalMessages,
        storageUsed: new Blob([JSON.stringify(chats) + JSON.stringify(messages)]).size
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalChats: 0, totalMessages: 0, storageUsed: 0 };
    }
  }

  deleteChat(chatId) {
    try {
      // Remove chat from chats list
      const chats = this.getChats();
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedChats));

      // Remove all messages for this chat
      const allMessages = localStorage.getItem(this.messagesKey);
      const messages = allMessages ? JSON.parse(allMessages) : {};
      delete messages[chatId];
      localStorage.setItem(this.messagesKey, JSON.stringify(messages));

      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }
}

// Create global instance
window.chatStorage = new ChatStorageService();
