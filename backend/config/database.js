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

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
