/**
 * Error handling middleware
 */
class ErrorHandler {
  /**
   * Global error handler
   * @param {Error} err - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  handle(err, req, res, next) {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let details = null;

    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation error';
      details = err.details || err.message;
    } else if (err.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
      statusCode = 403;
      message = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.name === 'ConflictError') {
      statusCode = 409;
      message = 'Resource conflict';
    } else if (err.name === 'RateLimitError') {
      statusCode = 429;
      message = 'Too many requests';
    } else if (err.name === 'BlockchainError') {
      statusCode = 502;
      message = 'Blockchain service error';
      details = err.message;
    } else if (err.name === 'IPFSError') {
      statusCode = 502;
      message = 'IPFS service error';
      details = err.message;
    } else if (err.code === 'ECONNREFUSED') {
      statusCode = 503;
      message = 'Service unavailable';
    } else if (err.code === 'ETIMEDOUT') {
      statusCode = 504;
      message = 'Request timeout';
    }

    // In development, include stack trace
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };

    if (details) {
      response.details = details;
    }

    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Handle 404 errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  handle404(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.name = 'NotFoundError';
    next(error);
  }

  /**
   * Handle async errors
   * @param {Function} fn - Async function
   * @returns {Function} - Wrapped function
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create custom error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} name - Error name
   * @returns {Error} - Custom error
   */
  createError(message, statusCode = 500, name = 'CustomError') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.name = name;
    return error;
  }

  /**
   * Handle blockchain errors
   * @param {Error} error - Original error
   * @returns {Error} - Formatted blockchain error
   */
  handleBlockchainError(error) {
    const blockchainError = new Error(`Blockchain error: ${error.message}`);
    blockchainError.name = 'BlockchainError';
    blockchainError.originalError = error;
    return blockchainError;
  }

  /**
   * Handle IPFS errors
   * @param {Error} error - Original error
   * @returns {Error} - Formatted IPFS error
   */
  handleIPFSError(error) {
    const ipfsError = new Error(`IPFS error: ${error.message}`);
    ipfsError.name = 'IPFSError';
    ipfsError.originalError = error;
    return ipfsError;
  }
}

module.exports = new ErrorHandler();
