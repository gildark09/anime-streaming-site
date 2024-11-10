const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

module.exports = limiter;
