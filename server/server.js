const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Robustly load environment variables from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Initiate Database Connection (non-blocking retry)
connectDB();

const app = express();

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint (Accessed at http://localhost:5000/api/health)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? 'connected'
      : dbState === 2
      ? 'connecting'
      : 'disconnected';

  res.status(200).json({
    status: 'online',
    message: 'Campus Clubs & Forums API is running smoothly',
    database: {
      status: dbStatus,
      host: mongoose.connection.host || '127.0.0.1',
      name: mongoose.connection.name || 'campus_clubs_db',
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Listen on all network interfaces (0.0.0.0) so localhost:5000 and 127.0.0.1:5000 work
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [Server] Campus Clubs Backend running on port ${PORT}`);
  console.log(`🌐 [Health Check]: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

// Gracefully handle EADDRINUSE if backend is already running on port 5000
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n======================================================`);
    console.log(`ℹ️  [Server] Port ${PORT} is already in use by an active backend.`);
    console.log(`🌐 [Server] Reusing active backend instance on http://localhost:${PORT}`);
    console.log(`🌐 [Health Check]: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);

    // Keep process alive so root development runner (concurrently) keeps running frontend
    setInterval(() => {}, 60000);
  } else {
    console.error(`[Server Error]: ${err.message}`);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Error]: ${err.message}`);
});

module.exports = app;
