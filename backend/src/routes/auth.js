const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with wallet signature
 * @access  Public
 */
router.post('/login',
  rateLimiter,
  validationMiddleware.validateAuth,
  authController.login
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  rateLimiter,
  validationMiddleware.validateAuth,
  authController.register
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  rateLimiter,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post('/logout',
  authMiddleware.authenticate,
  rateLimiter,
  authController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get('/me',
  authMiddleware.authenticate,
  authController.getCurrentUser
);

/**
 * @route   POST /api/auth/verify-signature
 * @desc    Verify wallet signature
 * @access  Public
 */
router.post('/verify-signature',
  rateLimiter,
  validationMiddleware.validateAuth,
  authController.verifySignature
);

module.exports = router;
