const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/identity/:address
 * @desc    Get identity information by wallet address
 * @access  Public
 */
router.get('/:address', 
  validationMiddleware.validateAddress,
  identityController.getIdentity
);

/**
 * @route   POST /api/identity/register
 * @desc    Register a new identity
 * @access  Private
 */
router.post('/register',
  authMiddleware.authenticate,
  validationMiddleware.validateIdentityRegistration,
  identityController.registerIdentity
);

/**
 * @route   PUT /api/identity/update
 * @desc    Update existing identity
 * @access  Private
 */
router.put('/update',
  authMiddleware.authenticate,
  validationMiddleware.validateIdentityUpdate,
  identityController.updateIdentity
);

/**
 * @route   DELETE /api/identity/deactivate
 * @desc    Deactivate identity
 * @access  Private
 */
router.delete('/deactivate',
  authMiddleware.authenticate,
  identityController.deactivateIdentity
);

/**
 * @route   GET /api/identity/:address/status
 * @desc    Check if identity exists and is active
 * @access  Public
 */
router.get('/:address/status',
  validationMiddleware.validateAddress,
  identityController.checkIdentityStatus
);

/**
 * @route   GET /api/identity/stats/total
 * @desc    Get total number of registered identities
 * @access  Public
 */
router.get('/stats/total',
  identityController.getTotalIdentities
);

/**
 * @route   POST /api/identity/batch
 * @desc    Get multiple identities by addresses
 * @access  Public
 */
router.post('/batch',
  validationMiddleware.validateBatchAddresses,
  identityController.getBatchIdentities
);

module.exports = router;
