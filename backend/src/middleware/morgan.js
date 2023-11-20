// TrustKey Morgan Logging Middleware

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom token for response time
morgan.token('response-time-ms', function (req, res) {
  return res.get('X-Response-Time') || '0';
});

// Custom token for user agent
morgan.token('user-agent', function (req, res) {
  return req.get('User-Agent') || 'Unknown';
});

// Custom token for remote address
morgan.token('remote-addr', function (req, res) {
  return req.ip || req.connection.remoteAddress || 'Unknown';
});

// Custom format for console logging
const consoleFormat = ':remote-addr :method :url :status :res[content-length] :response-time-ms ms :user-agent';

// Custom format for file logging
const fileFormat = ':date[iso] :remote-addr :method :url :status :res[content-length] :response-time-ms ms :user-agent';

// Console logging middleware
const consoleLogger = morgan(consoleFormat, {
  skip: function (req, res) {
    return process.env.NODE_ENV === 'test';
  }
});

// File logging middleware
const fileLogger = morgan(fileFormat, {
  stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' }),
  skip: function (req, res) {
    return process.env.NODE_ENV === 'test';
  }
});

// Error logging middleware
const errorLogger = morgan(fileFormat, {
  stream: fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' }),
  skip: function (req, res) {
    return res.statusCode < 400;
  }
});

module.exports = {
  consoleLogger,
  fileLogger,
  errorLogger,
};
