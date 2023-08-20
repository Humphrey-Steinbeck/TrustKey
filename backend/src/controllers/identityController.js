const blockchainService = require('../services/BlockchainService');
const ipfsService = require('../services/IPFSService');
const { VerifiableCredential, CredentialSubject, CredentialIssuer } = require('../models/Credential');
const { ethers } = require('ethers');

/**
 * Identity Controller
 * Handles identity-related operations
 */
class IdentityController {
  /**
   * Get identity information by wallet address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getIdentity(req, res) {
    try {
      const { address } = req.params;
      
      // Validate Ethereum address
      if (!ethers.utils.isAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Ethereum address format'
        });
      }

      // Get identity from blockchain
      const identityData = await blockchainService.getIdentity(address);
      
      if (!identityData.identityId || identityData.identityId === '0') {
        return res.status(404).json({
          success: false,
          error: 'Identity not found'
        });
      }

      // Get additional metadata from IPFS if available
      let metadata = null;
      if (identityData.metadataURI) {
        try {
          metadata = await ipfsService.getMetadata(identityData.metadataURI);
        } catch (error) {
          console.warn('Failed to fetch metadata from IPFS:', error.message);
        }
      }

      res.json({
        success: true,
        data: {
          identityId: identityData.identityId,
          wallet: address,
          credentialHash: identityData.credentialHash,
          timestamp: identityData.timestamp,
          isActive: identityData.isActive,
          metadataURI: identityData.metadataURI,
          metadata
        }
      });
    } catch (error) {
      console.error('Error getting identity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve identity information',
        message: error.message
      });
    }
  }

  /**
   * Register a new identity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async registerIdentity(req, res) {
    try {
      const { credentialData, metadata } = req.body;
      const walletAddress = req.user.address;

      // Create credential subject
      const credentialSubject = new CredentialSubject({
        id: `did:ethr:${walletAddress}`,
        type: 'Person',
        properties: credentialData.properties || {}
      });

      // Create credential issuer
      const credentialIssuer = new CredentialIssuer({
        id: `did:ethr:${process.env.ISSUER_ADDRESS || walletAddress}`,
        name: 'TrustKey Identity Issuer',
        type: 'Organization'
      });

      // Create verifiable credential
      const credential = new VerifiableCredential({
        type: credentialData.type || 'IdentityCredential',
        issuer: credentialIssuer,
        expirationDate: credentialData.expirationDate,
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

      // Upload metadata to IPFS
      const metadataURI = await ipfsService.uploadMetadata({
        credential: credential.toJsonLd(),
        metadata,
        timestamp: new Date().toISOString()
      });

      // Register identity on blockchain
      const txResult = await blockchainService.registerIdentity(
        walletAddress,
        credentialHash,
        metadataURI
      );

      res.status(201).json({
        success: true,
        message: 'Identity registered successfully',
        data: {
          identityId: credential.id,
          credentialHash,
          metadataURI,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber
        }
      });
    } catch (error) {
      console.error('Error registering identity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register identity',
        message: error.message
      });
    }
  }

  /**
   * Update existing identity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateIdentity(req, res) {
    try {
      const { credentialData, metadata } = req.body;
      const walletAddress = req.user.address;

      // Check if identity exists
      const existingIdentity = await blockchainService.getIdentity(walletAddress);
      if (!existingIdentity.identityId || existingIdentity.identityId === '0') {
        return res.status(404).json({
          success: false,
          error: 'Identity not found'
        });
      }

      // Create updated credential
      const credentialSubject = new CredentialSubject({
        id: `did:ethr:${walletAddress}`,
        type: 'Person',
        properties: credentialData.properties || {}
      });

      const credentialIssuer = new CredentialIssuer({
        id: `did:ethr:${process.env.ISSUER_ADDRESS || walletAddress}`,
        name: 'TrustKey Identity Issuer',
        type: 'Organization'
      });

      const credential = new VerifiableCredential({
        type: credentialData.type || 'IdentityCredential',
        issuer: credentialIssuer,
        expirationDate: credentialData.expirationDate,
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

      // Generate new credential hash
      const newCredentialHash = credential.generateHash();

      // Upload updated metadata to IPFS
      const newMetadataURI = await ipfsService.uploadMetadata({
        credential: credential.toJsonLd(),
        metadata,
        timestamp: new Date().toISOString(),
        previousVersion: existingIdentity.metadataURI
      });

      // Update identity on blockchain
      const txResult = await blockchainService.updateIdentity(
        walletAddress,
        newCredentialHash,
        newMetadataURI
      );

      res.json({
        success: true,
        message: 'Identity updated successfully',
        data: {
          identityId: credential.id,
          credentialHash: newCredentialHash,
          metadataURI: newMetadataURI,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber
        }
      });
    } catch (error) {
      console.error('Error updating identity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update identity',
        message: error.message
      });
    }
  }

  /**
   * Deactivate identity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deactivateIdentity(req, res) {
    try {
      const walletAddress = req.user.address;

      // Check if identity exists
      const existingIdentity = await blockchainService.getIdentity(walletAddress);
      if (!existingIdentity.identityId || existingIdentity.identityId === '0') {
        return res.status(404).json({
          success: false,
          error: 'Identity not found'
        });
      }

      // Deactivate identity on blockchain
      const txResult = await blockchainService.deactivateIdentity(walletAddress);

      res.json({
        success: true,
        message: 'Identity deactivated successfully',
        data: {
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber
        }
      });
    } catch (error) {
      console.error('Error deactivating identity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deactivate identity',
        message: error.message
      });
    }
  }

  /**
   * Check identity status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkIdentityStatus(req, res) {
    try {
      const { address } = req.params;
      
      if (!ethers.utils.isAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Ethereum address format'
        });
      }

      const hasActiveIdentity = await blockchainService.hasActiveIdentity(address);

      res.json({
        success: true,
        data: {
          address,
          hasActiveIdentity,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error checking identity status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check identity status',
        message: error.message
      });
    }
  }

  /**
   * Get total number of registered identities
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTotalIdentities(req, res) {
    try {
      const totalCount = await blockchainService.getTotalIdentities();

      res.json({
        success: true,
        data: {
          totalIdentities: totalCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting total identities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get total identities',
        message: error.message
      });
    }
  }

  /**
   * Get multiple identities by addresses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBatchIdentities(req, res) {
    try {
      const { addresses } = req.body;

      if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Addresses array is required and cannot be empty'
        });
      }

      if (addresses.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 50 addresses allowed per batch request'
        });
      }

      const identities = await Promise.all(
        addresses.map(async (address) => {
          try {
            if (!ethers.utils.isAddress(address)) {
              return {
                address,
                error: 'Invalid address format'
              };
            }

            const identityData = await blockchainService.getIdentity(address);
            return {
              address,
              identityId: identityData.identityId,
              isActive: identityData.isActive,
              credentialHash: identityData.credentialHash
            };
          } catch (error) {
            return {
              address,
              error: error.message
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          identities,
          count: identities.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting batch identities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get batch identities',
        message: error.message
      });
    }
  }
}

module.exports = new IdentityController();
