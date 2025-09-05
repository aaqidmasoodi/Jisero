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

// Middleware
app.use(cors());
app.use(express.json());
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

// User registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, preferredLanguage = 'en' } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Generate unique user ID
    const userId = `USER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const avatar = username.substring(0, 2).toUpperCase();

    const user = await database.createUser({
      userId,
      username,
      avatar,
      preferredLanguage
    });

    res.json({
      userId,
      username,
      avatar,
      preferredLanguage
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User lookup endpoint
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  socketHandlers.handleConnection(socket);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Jisero server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🗄️  SQLite database initialized`);
  console.log(`🌐 Frontend served from: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  database.close();
  process.exit(0);
});