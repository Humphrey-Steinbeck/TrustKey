const { VerifiableCredential, CredentialSubject, CredentialIssuer } = require('../models/Credential');
const blockchainService = require('../services/BlockchainService');
const ipfsService = require('../services/IPFSService');
const { ethers } = require('ethers');

/**
 * Credential Controller
 * Handles credential-related operations
 */
class CredentialController {
  /**
   * Generate a new verifiable credential
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateCredential(req, res) {
    try {
      const { type, subject, expirationDate, metadata } = req.body;
      const issuerAddress = req.user.address;

      // Create credential subject
      const credentialSubject = new CredentialSubject({
        id: subject.id,
        type: subject.type,
        properties: subject.properties
      });

      // Validate credential subject
      const subjectValidation = credentialSubject.validate();
      if (!subjectValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential subject',
          details: subjectValidation.errors
        });
      }

      // Create credential issuer
      const credentialIssuer = new CredentialIssuer({
        id: `did:ethr:${issuerAddress}`,
        name: 'TrustKey Credential Issuer',
        type: 'Organization'
      });

      // Validate credential issuer
      const issuerValidation = credentialIssuer.validate();
      if (!issuerValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential issuer',
          details: issuerValidation.errors
        });
      }

      // Create verifiable credential
      const credential = new VerifiableCredential({
        type,
        issuer: credentialIssuer,
        expirationDate,
        credentialSubject
      });

      // Validate credential
      const validation = credential.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential data',
          details: validation.errors
        });
      }

      // Generate credential hash
      const credentialHash = credential.generateHash();

      // Upload credential metadata to IPFS
      const metadataURI = await ipfsService.uploadMetadata({
        credential: credential.toJsonLd(),
        metadata,
        issuer: issuerAddress,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'Credential generated successfully',
        data: {
          credential: credential.toJsonLd(),
          credentialHash,
          metadataURI,
          id: credential.id
        }
      });
    } catch (error) {
      console.error('Error generating credential:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate credential',
        message: error.message
      });
    }
  }

  /**
   * Verify a verifiable credential
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyCredential(req, res) {
    try {
      const { credential, proof } = req.body;

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

      // Validate credential structure
      const validation = vc.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential structure',
          details: validation.errors
        });
      }

      // Generate credential hash
      const credentialHash = vc.generateHash();

      // Check if credential exists on blockchain
      const existsOnChain = await blockchainService.verifyCredentialHash(credentialHash);

      // Verify proof if provided
      let proofValid = true;
      if (proof) {
        // In a real implementation, this would verify the cryptographic proof
        proofValid = this.verifyCredentialProof(credential, proof);
      }

      res.json({
        success: true,
        data: {
          isValid: validation.isValid && existsOnChain && proofValid,
          credentialHash,
          existsOnChain,
          proofValid,
          validation: {
            structure: validation.isValid,
            blockchain: existsOnChain,
            proof: proofValid
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error verifying credential:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify credential',
        message: error.message
      });
    }
  }

  /**
   * Get credential information by hash
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCredentialByHash(req, res) {
    try {
      const { hash } = req.params;

      if (!ethers.utils.isHexString(hash) || hash.length !== 66) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential hash format'
        });
      }

      // Check if credential exists on blockchain
      const existsOnChain = await blockchainService.verifyCredentialHash(hash);

      if (!existsOnChain) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found'
        });
      }

      // Get identity information by hash
      const identityData = await blockchainService.getIdentityByHash(hash);

      res.json({
        success: true,
        data: {
          credentialHash: hash,
          existsOnChain,
          identityData,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting credential by hash:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get credential information',
        message: error.message
      });
    }
  }

  /**
   * Validate credential structure and format
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async validateCredential(req, res) {
    try {
      const { credential } = req.body;

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

      res.json({
        success: true,
        data: {
          isValid: validation.isValid,
          errors: validation.errors,
          credentialId: vc.id,
          credentialType: vc.type,
          issuer: vc.issuer,
          subject: vc.credentialSubject,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error validating credential:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate credential',
        message: error.message
      });
    }
  }

  /**
   * Revoke a credential
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async revokeCredential(req, res) {
    try {
      const { credentialHash, reason } = req.body;
      const issuerAddress = req.user.address;

      if (!credentialHash) {
        return res.status(400).json({
          success: false,
          error: 'Credential hash is required'
        });
      }

      // Check if credential exists
      const existsOnChain = await blockchainService.verifyCredentialHash(credentialHash);
      if (!existsOnChain) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found'
        });
      }

      // In a real implementation, this would interact with a revocation registry
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Credential revoked successfully',
        data: {
          credentialHash,
          revokedBy: issuerAddress,
          reason,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error revoking credential:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to revoke credential',
        message: error.message
      });
    }
  }

  /**
   * Get credential status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCredentialStatus(req, res) {
    try {
      const { hash } = req.params;

      if (!ethers.utils.isHexString(hash) || hash.length !== 66) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credential hash format'
        });
      }

      // Check if credential exists on blockchain
      const existsOnChain = await blockchainService.verifyCredentialHash(hash);

      // In a real implementation, this would also check revocation status
      const isRevoked = false;

      res.json({
        success: true,
        data: {
          credentialHash: hash,
          status: existsOnChain ? (isRevoked ? 'revoked' : 'active') : 'not_found',
          existsOnChain,
          isRevoked,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting credential status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get credential status',
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
      const { credentials } = req.body;

      if (!Array.isArray(credentials) || credentials.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Credentials array is required and cannot be empty'
        });
      }

      if (credentials.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 20 credentials allowed per batch request'
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

  /**
   * Verify credential proof (placeholder implementation)
   * @param {Object} credential - Credential data
   * @param {Object} proof - Proof data
   * @returns {boolean} - Proof validity
   */
  verifyCredentialProof(credential, proof) {
    // This is a placeholder implementation
    // In a real system, this would verify cryptographic proofs
    // such as digital signatures or zero-knowledge proofs
    
    if (!proof || !proof.type) {
      return false;
    }

    // Basic proof validation
    return proof.type === 'EcdsaSecp256k1Signature2019' && proof.jws;
  }
}

module.exports = new CredentialController();
