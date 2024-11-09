const express = require('express');
const cors = require('cors');
require('dotenv').config();
const limiter = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const CONSUMET_API = 'https://api.consumet.org';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'Range'],
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range', 
    'Accept-Ranges', 
    'Content-Length', 
    'Content-Type'
  ],
  credentials: true
}));
app.use(express.json());

// Apply rate limiter to all routes
app.use(limiter);

// Basic test route
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/anime', require('./routes/anime'));

// Add error handler last
app.use(errorHandler);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; 