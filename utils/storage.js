// PWA Storage utilities for offline functionality
const StorageUtils = {
  // IndexedDB for large data storage
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('JiseroDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('chats')) {
          const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
          chatStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('chatId', 'chatId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('pendingMessages')) {
          db.createObjectStore('pendingMessages', { keyPath: 'id' });
        }
      };
    });
  },

  // Store chat data offline
  async storeChats(chats) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['chats'], 'readwrite');
      const store = transaction.objectStore('chats');
      
      for (const chat of chats) {
        await store.put(chat);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to store chats:', error);
      return false;
    }
  },

  // Retrieve chats from offline storage
  async getChats() {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['chats'], 'readonly');
      const store = transaction.objectStore('chats');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get chats:', error);
      return [];
    }
  },

  // Store pending messages for offline sending
  async storePendingMessage(message) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      
      await store.put({
        ...message,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to store pending message:', error);
      return false;
    }
  },

  // Get pending messages for sync
  async getPendingMessages() {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['pendingMessages'], 'readonly');
      const store = transaction.objectStore('pendingMessages');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get pending messages:', error);
      return [];
    }
  },

  // Clear pending messages after successful sync
  async clearPendingMessages() {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      await store.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear pending messages:', error);
      return false;
    }
  },

  // Check if app is online
  isOnline() {
    return navigator.onLine;
  },

  // Listen for online/offline events
  setupNetworkListeners(onOnline, onOffline) {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
};

window.StorageUtils = StorageUtils;
