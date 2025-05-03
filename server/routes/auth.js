const express = require('express');
const router = express.Router();
const { loginLimiter, addRateLimitHeaders } = require('../middleware/rateLimiter');
const { register, login, logout, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Apply rate limiting and headers middleware specifically to login and register routes
router.post('/register', loginLimiter, addRateLimitHeaders, register);
router.post('/login', loginLimiter, addRateLimitHeaders, login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);

module.exports = router; 