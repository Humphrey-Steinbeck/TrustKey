// TrustKey Request Logger Middleware

const logger = require('../utils/logger');

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log request details
  logger.http(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    // Log response details
    logger.http(`Response ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
      timestamp: new Date().toISOString(),
    });
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

module.exports = requestLogger;
