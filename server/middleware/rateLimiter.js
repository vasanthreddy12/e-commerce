const rateLimit = require('express-rate-limit');

// Create limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
});

// Middleware to add rate limit headers to all responses
const addRateLimitHeaders = (req, res, next) => {
  if (req.rateLimit) {
    res.setHeader('X-RateLimit-Limit', 5);
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(req.rateLimit.resetTime).toUTCString());
  }
  next();
};

// Create stricter limiter for login/register endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  standardHeaders: true, // X-RateLimit-Limit etc.
  legacyHeaders: true, // X-RateLimit-* headers
  handler: (req, res) => {
    // Explicitly set rate limit headers
    console.log('Rate limit headers:', req.rateLimit);
    res.setHeader('X-RateLimit-Limit', 5);
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(req.rateLimit.resetTime).toUTCString());
    res.setHeader('Retry-After', Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000));

    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      rateLimitInfo: {
        limit: 5,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toUTCString()
      }
    });
  },
  // Store key by IP and path to handle each endpoint separately
  keyGenerator: (req) => {
    return `${req.ip}-${req.path}`;
  }
});

module.exports = { apiLimiter, loginLimiter, addRateLimitHeaders }; 