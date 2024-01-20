const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * @route   POST /api/verification/request
 * @desc    Request credential verification
 * @access  Private
 */
router.post('/request',
  authMiddleware.authenticate,
  rateLimiter,
  validationMiddleware.validateVerificationRequest,
  verificationController.requestVerification
);

/**
 * @route   POST /api/verification/complete
 * @desc    Complete verification process
 * @access  Private (Authorized verifiers only)
 */
router.post('/complete',
  authMiddleware.authenticate,
  authMiddleware.requireRole('verifier'),
  rateLimiter,
  verificationController.completeVerification
);

/**
 * @route   GET /api/verification/request/:requestId
 * @desc    Get verification request details
 * @access  Private
 */
router.get('/request/:requestId',
  authMiddleware.authenticate,
  verificationController.getVerificationRequest
);

/**
 * @route   GET /api/verification/requests
 * @desc    Get user's verification requests
 * @access  Private
 */
router.get('/requests',
  authMiddleware.authenticate,
  verificationController.getUserVerificationRequests
);

/**
 * @route   POST /api/verification/generate-proof
 * @desc    Generate ZKP proof for credential
 * @access  Private
 */
router.post('/generate-proof',
  authMiddleware.authenticate,
  rateLimiter,
  verificationController.generateProof
);

/**
 * @route   POST /api/verification/verify-proof
 * @desc    Verify ZKP proof
 * @access  Public
 */
router.post('/verify-proof',
  rateLimiter,
  verificationController.verifyProof
);

/**
 * @route   GET /api/verification/circuits
 * @desc    Get available verification circuits
 * @access  Public
 */
router.get('/circuits',
  verificationController.getAvailableCircuits
);

/**
 * @route   GET /api/verification/circuit/:circuitType
 * @desc    Get circuit information
 * @access  Public
 */
router.get('/circuit/:circuitType',
  verificationController.getCircuitInfo
);

/**
 * @route   POST /api/verification/batch-verify
 * @desc    Batch verify multiple credentials
 * @access  Private
 */
router.post('/batch-verify',
  authMiddleware.authenticate,
  rateLimiter,
  verificationController.batchVerifyCredentials
);

module.exports = router;
