const Joi = require('joi');
const { ethers } = require('ethers');

/**
 * Validation middleware
 */
class ValidationMiddleware {
  /**
   * Validate Ethereum address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateAddress(req, res, next) {
    const { address } = req.params;
    
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }
    
    next();
  }

  /**
   * Validate identity registration data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateIdentityRegistration(req, res, next) {
    const schema = Joi.object({
      credentialData: Joi.object({
        type: Joi.string().min(1).max(100).required(),
        expirationDate: Joi.date().greater('now').optional(),
        properties: Joi.object().optional()
      }).required(),
      metadata: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Validate identity update data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateIdentityUpdate(req, res, next) {
    const schema = Joi.object({
      credentialData: Joi.object({
        type: Joi.string().min(1).max(100).required(),
        expirationDate: Joi.date().greater('now').optional(),
        properties: Joi.object().optional()
      }).required(),
      metadata: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Validate batch addresses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateBatchAddresses(req, res, next) {
    const schema = Joi.object({
      addresses: Joi.array()
        .items(Joi.string().custom((value, helpers) => {
          if (!ethers.utils.isAddress(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }))
        .min(1)
        .max(50)
        .required()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Validate credential generation data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateCredentialGeneration(req, res, next) {
    const schema = Joi.object({
      type: Joi.string().min(1).max(100).required(),
      subject: Joi.object({
        id: Joi.string().required(),
        type: Joi.string().required(),
        properties: Joi.object().required()
      }).required(),
      expirationDate: Joi.date().greater('now').optional(),
      metadata: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Validate verification request data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateVerificationRequest(req, res, next) {
    const schema = Joi.object({
      credentialHash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]+$/).required(),
      verificationType: Joi.string().min(1).max(50).required(),
      proof: Joi.array().items(Joi.number()).length(8).required(),
      publicSignals: Joi.array().items(Joi.number()).length(2).required()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Validate reputation event data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateReputationEvent(req, res, next) {
    const schema = Joi.object({
      targetWallet: Joi.string().custom((value, helpers) => {
        if (!ethers.utils.isAddress(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required(),
      scoreChange: Joi.number().integer().min(-50).max(50).required(),
      eventType: Joi.string().min(1).max(50).required(),
      description: Joi.string().min(1).max(500).required(),
      proofHash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]+$/).required()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Validate authentication data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateAuth(req, res, next) {
    const schema = Joi.object({
      address: Joi.string().custom((value, helpers) => {
        if (!ethers.utils.isAddress(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).required(),
      signature: Joi.string().min(1).required(),
      message: Joi.string().min(1).required()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  }

  /**
   * Generic validation middleware
   * @param {Object} schema - Joi schema
   * @param {string} property - Request property to validate (body, query, params)
   * @returns {Function} - Middleware function
   */
  validate(schema, property = 'body') {
    return (req, res, next) => {
      const { error } = schema.validate(req[property]);
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(detail => detail.message)
        });
      }
      
      next();
    };
  }
}

module.exports = new ValidationMiddleware();
