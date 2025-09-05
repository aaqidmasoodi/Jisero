const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = path.join(__dirname, '../data/jisero.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT,
        preferred_language TEXT DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_online BOOLEAN DEFAULT 0
      )
    `);

    // Messages table for server-side persistence
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        chat_id TEXT NOT NULL,
        sender_user_id TEXT NOT NULL,
        recipient_user_id TEXT NOT NULL,
        message_text TEXT NOT NULL,
        original_text TEXT,
        translated_text TEXT,
        status TEXT DEFAULT 'sent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivered_at DATETIME,
        read_at DATETIME
      )
    `);

    // Chats table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT UNIQUE NOT NULL,
        user1_id TEXT NOT NULL,
        user2_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_chats_users ON chats(user1_id, user2_id)`);

    console.log('Database tables created');
  }

  // User methods
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { userId, username, avatar, preferredLanguage = 'en' } = userData;
      
      this.db.run(
        `INSERT INTO users (user_id, username, avatar, preferred_language) 
         VALUES (?, ?, ?, ?)`,
        [userId, username, avatar, preferredLanguage],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, userId });
          }
        }
      );
    });
  }

  async findUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async updateUserOnlineStatus(userId, isOnline) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET is_online = ?, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?',
        [isOnline ? 1 : 0, userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updateUser(userId, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(userId);

      this.db.run(
        `UPDATE users SET ${fields} WHERE user_id = ?`,
        values,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getAllOnlineUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT user_id, username, avatar FROM users WHERE is_online = 1',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Message persistence methods
  async saveMessage(messageData) {
    return new Promise((resolve, reject) => {
      const { messageId, chatId, senderUserId, recipientUserId, messageText, originalText, translatedText } = messageData;
      
      this.db.run(
        `INSERT OR IGNORE INTO messages (message_id, chat_id, sender_user_id, recipient_user_id, message_text, original_text, translated_text, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'sent')`,
        [messageId, chatId, senderUserId, recipientUserId, messageText, originalText, translatedText],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, messageId, inserted: this.changes > 0 });
          }
        }
      );
    });
  }

  async updateMessageStatus(messageId, status, timestamp = null) {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE messages SET status = ?';
      let params = [status, messageId];
      
      if (status === 'delivered' && timestamp) {
        query += ', delivered_at = ?';
        params = [status, timestamp, messageId];
      } else if (status === 'read' && timestamp) {
        query += ', read_at = ?';
        params = [status, timestamp, messageId];
      }
      
      query += ' WHERE message_id = ?';
      
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async getUndeliveredMessages(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM messages WHERE recipient_user_id = ? AND status IN ('sent', 'queued') ORDER BY created_at ASC`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  async findOrCreateChat(user1Id, user2Id) {
    return new Promise((resolve, reject) => {
      // First try to find existing chat
      this.db.get(
        `SELECT * FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
        [user1Id, user2Id, user2Id, user1Id],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            // Create new chat
            const chatId = `chat_${user1Id}_${user2Id}_${Date.now()}`;
            this.db.run(
              `INSERT INTO chats (chat_id, user1_id, user2_id) VALUES (?, ?, ?)`,
              [chatId, user1Id, user2Id],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ id: this.lastID, chat_id: chatId, user1_id: user1Id, user2_id: user2Id });
                }
              }
            );
          }
        }
      );
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
