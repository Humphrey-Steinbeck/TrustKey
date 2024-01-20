const express = require('express');
const router = express.Router();
const reputationController = require('../controllers/reputationController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * @route   GET /api/reputation/:address
 * @desc    Get reputation data for a wallet address
 * @access  Public
 */
router.get('/:address',
  validationMiddleware.validateAddress,
  rateLimiter,
  reputationController.getReputationData
);

/**
 * @route   POST /api/reputation/issue-event
 * @desc    Issue a reputation event
 * @access  Private (Authorized issuers only)
 */
router.post('/issue-event',
  authMiddleware.authenticate,
  authMiddleware.requireRole('issuer'),
  rateLimiter,
  validationMiddleware.validateReputationEvent,
  reputationController.issueReputationEvent
);

/**
 * @route   GET /api/reputation/:address/events
 * @desc    Get reputation events for a wallet
 * @access  Public
 */
router.get('/:address/events',
  validationMiddleware.validateAddress,
  rateLimiter,
  reputationController.getReputationEvents
);

/**
 * @route   GET /api/reputation/event/:eventId
 * @desc    Get reputation event details
 * @access  Public
 */
router.get('/event/:eventId',
  rateLimiter,
  reputationController.getReputationEvent
);

/**
 * @route   POST /api/reputation/batch
 * @desc    Get reputation data for multiple wallets
 * @access  Public
 */
router.post('/batch',
  validationMiddleware.validateBatchAddresses,
  rateLimiter,
  reputationController.getBatchReputationData
);

/**
 * @route   GET /api/reputation/stats/leaderboard
 * @desc    Get reputation leaderboard
 * @access  Public
 */
router.get('/stats/leaderboard',
  rateLimiter,
  reputationController.getReputationLeaderboard
);

/**
 * @route   GET /api/reputation/stats/overview
 * @desc    Get reputation system overview
 * @access  Public
 */
router.get('/stats/overview',
  rateLimiter,
  reputationController.getReputationOverview
);

module.exports = router;
