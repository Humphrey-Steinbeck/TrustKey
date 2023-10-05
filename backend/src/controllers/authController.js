const { ethers } = require('ethers');
const authMiddleware = require('../middleware/auth');
const blockchainService = require('../services/BlockchainService');

/**
 * Authentication Controller
 * Handles user authentication and authorization
 */
class AuthController {
  /**
   * Login user with wallet signature
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { address, signature, message } = req.body;

      // Verify signature
      const isValidSignature = this.verifySignature(address, message, signature);
      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      // Check if user has registered identity
      const hasIdentity = await blockchainService.hasActiveIdentity(address);
      if (!hasIdentity) {
        return res.status(404).json({
          success: false,
          error: 'Identity not registered. Please register first.'
        });
      }

      // Generate tokens
      const tokenPayload = {
        address,
        id: address,
        role: 'user'
      };

      const accessToken = authMiddleware.generateToken(tokenPayload);
      const refreshToken = authMiddleware.generateRefreshToken(tokenPayload);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          user: {
            address,
            hasIdentity,
            role: 'user'
          }
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * Register new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { address, signature, message } = req.body;

      // Verify signature
      const isValidSignature = this.verifySignature(address, message, signature);
      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      // Check if user already has identity
      const hasIdentity = await blockchainService.hasActiveIdentity(address);
      if (hasIdentity) {
        return res.status(409).json({
          success: false,
          error: 'Identity already registered'
        });
      }

      // Generate tokens
      const tokenPayload = {
        address,
        id: address,
        role: 'user'
      };

      const accessToken = authMiddleware.generateToken(tokenPayload);
      const refreshToken = authMiddleware.generateRefreshToken(tokenPayload);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          accessToken,
          refreshToken,
          user: {
            address,
            hasIdentity: false,
            role: 'user'
          }
        }
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = authMiddleware.verifyRefreshToken(refreshToken);

      // Generate new access token
      const tokenPayload = {
        address: decoded.address,
        id: decoded.id,
        role: decoded.role || 'user'
      };

      const newAccessToken = authMiddleware.generateToken(tokenPayload);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // In a real implementation, you would invalidate the token
      // For now, we'll just return success
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * Get current user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      const { address } = req.user;

      // Get identity information
      let identityData = null;
      try {
        identityData = await blockchainService.getIdentity(address);
      } catch (error) {
        console.warn('Failed to get identity data:', error.message);
      }

      // Get reputation data
      let reputationData = null;
      try {
        reputationData = await blockchainService.getReputationData(address);
      } catch (error) {
        console.warn('Failed to get reputation data:', error.message);
      }

      res.json({
        success: true,
        data: {
          user: {
            address,
            role: req.user.role
          },
          identity: identityData,
          reputation: reputationData
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user information',
        message: error.message
      });
    }
  }

  /**
   * Verify wallet signature
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifySignature(req, res) {
    try {
      const { address, signature, message } = req.body;

      const isValidSignature = this.verifySignature(address, message, signature);

      res.json({
        success: true,
        data: {
          isValid: isValidSignature,
          address,
          message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error verifying signature:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify signature',
        message: error.message
      });
    }
  }

  /**
   * Verify wallet signature
   * @param {string} address - Wallet address
   * @param {string} message - Original message
   * @param {string} signature - Signature to verify
   * @returns {boolean} - Signature validity
   */
  verifySignature(address, message, signature) {
    try {
      // Recover address from signature
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      // Check if recovered address matches the provided address
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Generate authentication message
   * @param {string} address - Wallet address
   * @returns {string} - Authentication message
   */
  generateAuthMessage(address) {
    const timestamp = new Date().toISOString();
    return `TrustKey Authentication\nAddress: ${address}\nTimestamp: ${timestamp}\nNonce: ${Math.random().toString(36).substring(2, 15)}`;
  }
}

module.exports = new AuthController();
