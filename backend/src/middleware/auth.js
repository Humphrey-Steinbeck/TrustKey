const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/database');

/**
 * Authentication middleware
 */
class AuthMiddleware {
  /**
   * Authenticate JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Access token required'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify JWT token
      const decoded = jwt.verify(token, jwtConfig.secret);
      
      // Add user info to request
      req.user = {
        address: decoded.address,
        id: decoded.id,
        role: decoded.role || 'user'
      };
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }
      
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  /**
   * Optional authentication (doesn't fail if no token)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, jwtConfig.secret);
        
        req.user = {
          address: decoded.address,
          id: decoded.id,
          role: decoded.role || 'user'
        };
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  }

  /**
   * Require specific role
   * @param {string} requiredRole - Required role
   * @returns {Function} - Middleware function
   */
  requireRole(requiredRole) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (req.user.role !== requiredRole && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }

  /**
   * Require admin role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {string} - JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @returns {string} - Refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn
    });
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token
   * @returns {Object} - Decoded payload
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, jwtConfig.secret);
  }
}

module.exports = new AuthMiddleware();
