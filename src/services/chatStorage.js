class ChatStorageService {
  constructor() {
    this.storageKey = 'jisero_chats';
    this.userKey = 'jisero_user';
    this.messagesKey = 'jisero_messages';
  }

  // User management
  getCurrentUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(userData) {
    localStorage.setItem(this.userKey, JSON.stringify(userData));
  }

  generateUserId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  // Chat management
  getChats() {
    const chats = localStorage.getItem(this.storageKey);
    return chats ? JSON.parse(chats) : [];
  }

  saveChats(chats) {
    localStorage.setItem(this.storageKey, JSON.stringify(chats));
  }

  createChat(userId, userName) {
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
  }

  updateChatLastMessage(chatId, message, timestamp) {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = message;
      chats[chatIndex].timestamp = this.formatTimestamp(timestamp);
      this.saveChats(chats);
    }
  }

  updateChatOnlineStatus(userId, isOnline) {
    const chats = this.getChats();
    let updated = false;
    
    // Update ALL chats with this userId (in case there are duplicates)
    chats.forEach(chat => {
      if (chat.userId === userId) {
        chat.isOnline = isOnline;
        updated = true;
      }
    });
    
    if (updated) {
      this.saveChats(chats);
      console.log(`Updated online status for ${userId}: ${isOnline}`);
    }
  }

  // Remove duplicate chats (cleanup function)
  removeDuplicateChats() {
    const chats = this.getChats();
    const uniqueChats = [];
    const seenUserIds = new Set();
    
    chats.forEach(chat => {
      if (!seenUserIds.has(chat.userId)) {
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
  }

  // Message management
  getMessages(chatId) {
    const allMessages = localStorage.getItem(this.messagesKey);
    const messages = allMessages ? JSON.parse(allMessages) : {};
    return messages[chatId] || [];
  }

  saveMessage(chatId, message) {
    const allMessages = localStorage.getItem(this.messagesKey);
    const messages = allMessages ? JSON.parse(allMessages) : {};
    
    if (!messages[chatId]) {
      messages[chatId] = [];
    }

    const messageWithId = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: message.timestamp || new Date().toISOString(),
      status: message.status || 'sent' // sent, delivered, failed
    };

    messages[chatId].push(messageWithId);
    localStorage.setItem(this.messagesKey, JSON.stringify(messages));
    
    // Update chat last message
    this.updateChatLastMessage(chatId, message.text, messageWithId.timestamp);
    
    return messageWithId;
  }

  updateMessageStatus(chatId, messageId, status) {
    const allMessages = localStorage.getItem(this.messagesKey);
    const messages = allMessages ? JSON.parse(allMessages) : {};
    
    if (messages[chatId]) {
      const messageIndex = messages[chatId].findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        messages[chatId][messageIndex].status = status;
        localStorage.setItem(this.messagesKey, JSON.stringify(messages));
      }
    }
  }

  // Utility functions
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
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
  }

  // Clear all data (for testing)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.messagesKey);
    localStorage.removeItem(this.userKey);
  }
}

// Create global instance
window.chatStorage = new ChatStorageService();
