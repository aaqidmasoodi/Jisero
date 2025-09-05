require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Import services and controllers
const TranslationService = require('./services/translation');
const TranslationController = require('./controllers/translationController');
const createTranslationRoutes = require('./routes/translation');
const SocketHandlers = require('./utils/socketHandlers');
const Database = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('../')); // Serve frontend files

// Initialize database
const database = new Database();

// Initialize services
const translationService = new TranslationService(
  process.env.DEEP_L_API_KEY,
  process.env.GROQ_API_KEY
);

const translationController = new TranslationController(translationService);
const socketHandlers = new SocketHandlers(translationService, database);

// Routes
app.use('/api', createTranslationRoutes(translationController));

// User registration endpoint with validation
app.post('/api/register', async (req, res) => {
  try {
    const { username, preferredLanguage = 'en' } = req.body;
    
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (username.length > 50) {
      return res.status(400).json({ error: 'Username too long' });
    }

    // Generate unique user ID
    const userId = `USER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const avatar = username.substring(0, 2).toUpperCase();

    const user = await database.createUser({
      userId,
      username: username.trim(),
      avatar,
      preferredLanguage
    });

    console.log(`✅ User registered: ${userId} (${username})`);

    res.json({
      userId,
      username: username.trim(),
      avatar,
      preferredLanguage
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// User lookup endpoint
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await database.findUser(userId);
    
    if (user) {
      res.json({
        userId: user.user_id,
        username: user.username,
        avatar: user.avatar,
        isOnline: user.is_online === 1,
        lastSeen: user.last_seen
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ error: 'User lookup failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Socket.IO connection handling with error handling
io.on('connection', (socket) => {
  try {
    socketHandlers.handleConnection(socket);
  } catch (error) {
    console.error('Socket connection error:', error);
    socket.emit('error', { message: 'Connection failed' });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in development, but log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Jisero server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🗄️  SQLite database initialized`);
  console.log(`🌐 Frontend served from: http://localhost:${PORT}`);
  console.log(`💾 Memory usage:`, process.memoryUsage());
});

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('Shutting down server...');
  database.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);

process.on('SIGTERM', gracefulShutdown);