const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * @route   POST /api/credential/generate
 * @desc    Generate a new verifiable credential
 * @access  Private
 */
router.post('/generate',
  authMiddleware.authenticate,
  rateLimiter,
  validationMiddleware.validateCredentialGeneration,
  credentialController.generateCredential
);

/**
 * @route   POST /api/credential/verify
 * @desc    Verify a verifiable credential
 * @access  Public
 */
router.post('/verify',
  rateLimiter,
  credentialController.verifyCredential
);

/**
 * @route   GET /api/credential/:hash
 * @desc    Get credential information by hash
 * @access  Public
 */
router.get('/:hash',
  rateLimiter,
  credentialController.getCredentialByHash
);

/**
 * @route   POST /api/credential/validate
 * @desc    Validate credential structure and format
 * @access  Public
 */
router.post('/validate',
  rateLimiter,
  credentialController.validateCredential
);

/**
 * @route   POST /api/credential/revoke
 * @desc    Revoke a credential
 * @access  Private
 */
router.post('/revoke',
  authMiddleware.authenticate,
  rateLimiter,
  credentialController.revokeCredential
);

/**
 * @route   GET /api/credential/status/:hash
 * @desc    Check credential status (active/revoked)
 * @access  Public
 */
router.get('/status/:hash',
  rateLimiter,
  credentialController.getCredentialStatus
);

/**
 * @route   POST /api/credential/batch-verify
 * @desc    Verify multiple credentials in batch
 * @access  Public
 */
router.post('/batch-verify',
  rateLimiter,
  credentialController.batchVerifyCredentials
);

module.exports = router;
