// TrustKey Security Middleware

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Identity operations rate limiter
 */
const identityLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many identity operations, please try again later.',
    code: 'IDENTITY_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Read operations rate limiter
 */
const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many read requests, please try again later.',
    code: 'READ_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Slow down middleware
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // max delay of 20 seconds
});

/**
 * Security headers middleware
 */
function securityHeaders(req, res, next) {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set CSP header
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https: wss: ws:;"
  );
  
  next();
}

/**
 * Request ID middleware
 */
function requestId(req, res, next) {
  const requestId = req.headers['x-request-id'] || 
                   req.headers['x-correlation-id'] || 
                   generateRequestId();
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = {
  generalLimiter,
  authLimiter,
  identityLimiter,
  readLimiter,
  speedLimiter,
  securityHeaders,
  requestId,
};
