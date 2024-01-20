const zkpService = require('../services/ZKPService');
const blockchainService = require('../services/BlockchainService');
const { VerifiableCredential } = require('../models/Credential');

/**
 * Verification Controller
 * Handles credential verification and ZKP operations
 */
class VerificationController {
  /**
   * Request credential verification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async requestVerification(req, res) {
    try {
      const { credentialHash, verificationType, proof, publicSignals } = req.body;
      const requesterAddress = req.user.address;

      // Verify that the credential exists
      const credentialExists = await blockchainService.verifyCredentialHash(credentialHash);
      if (!credentialExists) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found or inactive'
        });
      }

      // Request verification on blockchain
      const txResult = await blockchainService.requestVerification(
        credentialHash,
        verificationType,
        proof,
        publicSignals
      );

      res.status(201).json({
        success: true,
        message: 'Verification request submitted successfully',
        data: {
          credentialHash,
          verificationType,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error requesting verification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to request verification',
        message: error.message
      });
    }
  }

  /**
   * Complete verification process
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async completeVerification(req, res) {
    try {
      const { requestId, isVerified, verificationHash } = req.body;

      // Complete verification on blockchain
      const txResult = await blockchainService.completeVerification(
        requestId,
        isVerified,
        verificationHash
      );

      res.json({
        success: true,
        message: 'Verification completed successfully',
        data: {
          requestId,
          isVerified,
          verificationHash,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error completing verification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete verification',
        message: error.message
      });
    }
  }

  /**
   * Get verification request details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getVerificationRequest(req, res) {
    try {
      const { requestId } = req.params;

      // Get verification request from blockchain
      const requestData = await blockchainService.getVerificationRequest(requestId);

      if (!requestData || !requestData.requestId) {
        return res.status(404).json({
          success: false,
          error: 'Verification request not found'
        });
      }

      res.json({
        success: true,
        data: requestData
      });
    } catch (error) {
      console.error('Error getting verification request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get verification request',
        message: error.message
      });
    }
  }

  /**
   * Get user's verification requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserVerificationRequests(req, res) {
    try {
      const userAddress = req.user.address;

      // In a real implementation, this would query the database for user's requests
      // For now, return mock data
      const requests = [
        {
          requestId: '1',
          credentialHash: '0x1234567890abcdef...',
          verificationType: 'identity_verification',
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: {
          requests,
          count: requests.length
        }
      });
    } catch (error) {
      console.error('Error getting user verification requests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get verification requests',
        message: error.message
      });
    }
  }

  /**
   * Generate ZKP proof for credential
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateProof(req, res) {
    try {
      const { credential, privateInputs, circuitType } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          error: 'Credential data is required'
        });
      }

      // Parse credential if it's a string
      const credentialData = typeof credential === 'string' 
        ? JSON.parse(credential) 
        : credential;

      // Create credential instance
      const vc = VerifiableCredential.fromJsonLd(credentialData);

      // Validate credential
      const validation = vc.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential data',
          details: validation.errors
        });
      }

      // Generate ZKP proof
      const proofResult = await zkpService.generateProof(
        credentialData,
        privateInputs || {},
        circuitType
      );

      res.json({
        success: true,
        message: 'ZKP proof generated successfully',
        data: proofResult
      });
    } catch (error) {
      console.error('Error generating ZKP proof:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate ZKP proof',
        message: error.message
      });
    }
  }

  /**
   * Verify ZKP proof
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyProof(req, res) {
    try {
      const { proof, publicSignals, circuitType } = req.body;

      if (!proof || !publicSignals) {
        return res.status(400).json({
          success: false,
          error: 'Proof and public signals are required'
        });
      }

      // Verify ZKP proof
      const isValid = await zkpService.verifyProof(proof, publicSignals, circuitType);

      res.json({
        success: true,
        data: {
          isValid,
          circuitType,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error verifying ZKP proof:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify ZKP proof',
        message: error.message
      });
    }
  }

  /**
   * Get available verification circuits
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableCircuits(req, res) {
    try {
      const circuits = zkpService.getAvailableCircuits();
      const circuitInfo = circuits.map(circuitType => ({
        type: circuitType,
        info: zkpService.getCircuitInfo(circuitType)
      }));

      res.json({
        success: true,
        data: {
          circuits: circuitInfo,
          count: circuits.length
        }
      });
    } catch (error) {
      console.error('Error getting available circuits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available circuits',
        message: error.message
      });
    }
  }

  /**
   * Get circuit information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCircuitInfo(req, res) {
    try {
      const { circuitType } = req.params;
      const circuitInfo = zkpService.getCircuitInfo(circuitType);

      if (!circuitInfo) {
        return res.status(404).json({
          success: false,
          error: 'Circuit type not found'
        });
      }

      res.json({
        success: true,
        data: {
          type: circuitType,
          ...circuitInfo
        }
      });
    } catch (error) {
      console.error('Error getting circuit info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get circuit information',
        message: error.message
      });
    }
  }

  /**
   * Batch verify multiple credentials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async batchVerifyCredentials(req, res) {
    try {
      const { credentials, circuitType } = req.body;

      if (!Array.isArray(credentials) || credentials.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Credentials array is required and cannot be empty'
        });
      }

      if (credentials.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 credentials allowed per batch request'
        });
      }

      const results = await Promise.all(
        credentials.map(async (credentialData) => {
          try {
            const credential = typeof credentialData === 'string' 
              ? JSON.parse(credentialData) 
              : credentialData;

            const vc = VerifiableCredential.fromJsonLd(credential);
            const validation = vc.validate();
            const credentialHash = vc.generateHash();
            const existsOnChain = await blockchainService.verifyCredentialHash(credentialHash);

            return {
              credentialId: vc.id,
              isValid: validation.isValid && existsOnChain,
              validation: {
                structure: validation.isValid,
                blockchain: existsOnChain
              },
              credentialHash
            };
          } catch (error) {
            return {
              error: error.message,
              isValid: false
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          results,
          count: results.length,
          validCount: results.filter(r => r.isValid).length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error batch verifying credentials:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to batch verify credentials',
        message: error.message
      });
    }
  }
}

module.exports = new VerificationController();
