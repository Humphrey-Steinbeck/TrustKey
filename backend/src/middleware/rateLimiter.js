const rateLimit = require('express-rate-limit');
const { rateLimit: rateLimitConfig } = require('../config/database');

/**
 * Rate limiting middleware
 */
class RateLimiter {
  /**
   * General API rate limiter
   */
  general() {
    return rateLimit({
      windowMs: rateLimitConfig.windowMs,
      max: rateLimitConfig.max,
      message: {
        success: false,
        error: rateLimitConfig.message,
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: rateLimitConfig.message,
          retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
        });
      }
    });
  }

  /**
   * Strict rate limiter for authentication endpoints
   */
  auth() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        retryAfter: 900 // 15 minutes in seconds
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    });
  }

  /**
   * Moderate rate limiter for identity operations
   */
  identity() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 20, // 20 requests per window
      message: {
        success: false,
        error: 'Too many identity requests, please try again later',
        retryAfter: 300 // 5 minutes in seconds
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Lenient rate limiter for read operations
   */
  read() {
    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // 100 requests per window
      message: {
        success: false,
        error: 'Too many read requests, please try again later',
        retryAfter: 60 // 1 minute in seconds
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Custom rate limiter
   * @param {Object} options - Rate limit options
   * @returns {Function} - Rate limiter middleware
   */
  custom(options) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 100,
      message: {
        success: false,
        error: options.message || 'Too many requests, please try again later',
        retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      ...options
    });
  }
}

module.exports = new RateLimiter().general();
