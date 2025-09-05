class MessageQueueService {
  constructor() {
    this.queueKey = 'jisero_message_queue';
    this.pendingMessages = new Map(); // In-memory pending messages
  }

  // Queue message for offline user
  queueMessage(recipientUserId, message) {
    const queue = this.getQueue();
    
    if (!queue[recipientUserId]) {
      queue[recipientUserId] = [];
    }

    const queuedMessage = {
      ...message,
      queuedAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    };

    queue[recipientUserId].push(queuedMessage);
    this.saveQueue(queue);
    
    return queuedMessage;
  }

  // Get queued messages for a user
  getQueuedMessages(userId) {
    const queue = this.getQueue();
    return queue[userId] || [];
  }

  // Remove message from queue (when delivered)
  removeFromQueue(recipientUserId, messageId) {
    const queue = this.getQueue();
    
    if (queue[recipientUserId]) {
      queue[recipientUserId] = queue[recipientUserId].filter(
        msg => msg.id !== messageId
      );
      
      if (queue[recipientUserId].length === 0) {
        delete queue[recipientUserId];
      }
      
      this.saveQueue(queue);
    }
  }

  // Process queued messages when user comes online
  async processQueuedMessages(userId, socketService) {
    const queuedMessages = this.getQueuedMessages(userId);
    
    if (queuedMessages.length === 0) return;

    console.log(`Processing ${queuedMessages.length} queued messages for ${userId}`);

    for (const queuedMessage of queuedMessages) {
      try {
        // Send the queued message via socket with proper structure
        if (socketService && socketService.connected) {
          // Use the socket's sendMessage method directly
          const messageData = {
            chatId: queuedMessage.chatId,
            message: queuedMessage.message,
            recipientUserId: userId,
            senderUserId: queuedMessage.senderUserId,
            timestamp: queuedMessage.timestamp
          };
          
          // Send directly via socket emit (bypass the online check)
          socketService.socket.emit('send-message', messageData);
          console.log(`Sent queued message to ${userId}:`, queuedMessage.message.text);
          
          // Mark as delivered and remove from queue
          this.removeFromQueue(userId, queuedMessage.id);
          
          // Update message status in chat storage
          if (window.chatStorage) {
            window.chatStorage.updateMessageStatus(
              queuedMessage.chatId, 
              queuedMessage.message.id, 
              'delivered'
            );
          }
        }
      } catch (error) {
        console.error('Failed to send queued message:', error);
        
        // Increment attempt count
        queuedMessage.attempts = (queuedMessage.attempts || 0) + 1;
        
        if (queuedMessage.attempts >= queuedMessage.maxAttempts) {
          // Mark as failed and remove from queue
          this.removeFromQueue(userId, queuedMessage.id);
          
          if (window.chatStorage) {
            window.chatStorage.updateMessageStatus(
              queuedMessage.chatId, 
              queuedMessage.message.id, 
              'failed'
            );
          }
        }
      }
    }
  }

  // Get queue from localStorage
  getQueue() {
    const queue = localStorage.getItem(this.queueKey);
    return queue ? JSON.parse(queue) : {};
  }

  // Save queue to localStorage
  saveQueue(queue) {
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  // Get pending message count for a user
  getPendingCount(userId) {
    const queuedMessages = this.getQueuedMessages(userId);
    return queuedMessages.length;
  }

  // Clear old queued messages (older than 7 days)
  cleanupOldMessages() {
    const queue = this.getQueue();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    let hasChanges = false;
    
    Object.keys(queue).forEach(userId => {
      queue[userId] = queue[userId].filter(message => {
        const queuedAt = new Date(message.queuedAt);
        return queuedAt > sevenDaysAgo;
      });
      
      if (queue[userId].length === 0) {
        delete queue[userId];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveQueue(queue);
    }
  }

  // Clear all queued messages
  clearQueue() {
    localStorage.removeItem(this.queueKey);
  }
}

// Create global instance
window.messageQueue = new MessageQueueService();
