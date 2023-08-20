const { ethers } = require('ethers');
const { provider, wallet, blockchain } = require('../config/database');

/**
 * Blockchain Service for interacting with TrustKey smart contracts
 */
class BlockchainService {
  constructor() {
    this.provider = provider;
    this.wallet = wallet;
    this.contracts = {};
    this.initialized = false;
  }

  /**
   * Initialize contract instances
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load contract ABIs (in production, these would be loaded from build artifacts)
      const IdentityRegistryABI = this.getIdentityRegistryABI();
      const ReputationScoreABI = this.getReputationScoreABI();
      const VCVerifierABI = this.getVCVerifierABI();

      // Initialize contract instances
      if (blockchain.contracts.IdentityRegistry) {
        this.contracts.identityRegistry = new ethers.Contract(
          blockchain.contracts.IdentityRegistry,
          IdentityRegistryABI,
          this.wallet || this.provider
        );
      }

      if (blockchain.contracts.ReputationScore) {
        this.contracts.reputationScore = new ethers.Contract(
          blockchain.contracts.ReputationScore,
          ReputationScoreABI,
          this.wallet || this.provider
        );
      }

      if (blockchain.contracts.VCVerifier) {
        this.contracts.vcVerifier = new ethers.Contract(
          blockchain.contracts.VCVerifier,
          VCVerifierABI,
          this.wallet || this.provider
        );
      }

      this.initialized = true;
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Register identity on blockchain
   * @param {string} walletAddress - Wallet address
   * @param {string} credentialHash - Credential hash
   * @param {string} metadataURI - IPFS metadata URI
   * @returns {Promise<Object>} - Transaction result
   */
  async registerIdentity(walletAddress, credentialHash, metadataURI) {
    await this.initialize();
    
    if (!this.contracts.identityRegistry) {
      throw new Error('IdentityRegistry contract not initialized');
    }

    try {
      const tx = await this.contracts.identityRegistry.registerIdentity(
        credentialHash,
        metadataURI,
        {
          gasLimit: blockchain.gasConfig.gasLimit,
          gasPrice: blockchain.gasConfig.gasPrice
        }
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to register identity:', error);
      throw new Error(`Identity registration failed: ${error.message}`);
    }
  }

  /**
   * Get identity information from blockchain
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} - Identity data
   */
  async getIdentity(walletAddress) {
    await this.initialize();
    
    if (!this.contracts.identityRegistry) {
      throw new Error('IdentityRegistry contract not initialized');
    }

    try {
      const [identityId, credentialHash, timestamp, isActive, metadataURI] = 
        await this.contracts.identityRegistry.getIdentityByWallet(walletAddress);

      return {
        identityId: identityId.toString(),
        credentialHash,
        timestamp: timestamp.toString(),
        isActive,
        metadataURI
      };
    } catch (error) {
      console.error('Failed to get identity:', error);
      throw new Error(`Failed to retrieve identity: ${error.message}`);
    }
  }

  /**
   * Issue reputation event
   * @param {string} targetWallet - Target wallet address
   * @param {number} scoreChange - Score change amount
   * @param {string} eventType - Type of event
   * @param {string} description - Event description
   * @param {string} proofHash - Proof hash
   * @returns {Promise<Object>} - Transaction result
   */
  async issueReputationEvent(targetWallet, scoreChange, eventType, description, proofHash) {
    await this.initialize();
    
    if (!this.contracts.reputationScore) {
      throw new Error('ReputationScore contract not initialized');
    }

    try {
      const tx = await this.contracts.reputationScore.issueReputationEvent(
        targetWallet,
        scoreChange,
        eventType,
        description,
        proofHash,
        {
          gasLimit: blockchain.gasConfig.gasLimit,
          gasPrice: blockchain.gasConfig.gasPrice
        }
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to issue reputation event:', error);
      throw new Error(`Reputation event issuance failed: ${error.message}`);
    }
  }

  /**
   * Get reputation data
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} - Reputation data
   */
  async getReputationData(walletAddress) {
    await this.initialize();
    
    if (!this.contracts.reputationScore) {
      throw new Error('ReputationScore contract not initialized');
    }

    try {
      const [totalScore, trustLevel, lastUpdated, positiveEvents, negativeEvents, isActive] = 
        await this.contracts.reputationScore.getReputationData(walletAddress);

      return {
        totalScore: totalScore.toString(),
        trustLevel: trustLevel.toString(),
        lastUpdated: lastUpdated.toString(),
        positiveEvents: positiveEvents.toString(),
        negativeEvents: negativeEvents.toString(),
        isActive
      };
    } catch (error) {
      console.error('Failed to get reputation data:', error);
      throw new Error(`Failed to retrieve reputation data: ${error.message}`);
    }
  }

  /**
   * Request credential verification
   * @param {string} credentialHash - Credential hash
   * @param {string} verificationType - Type of verification
   * @param {Array} proof - ZKP proof components
   * @param {Array} publicSignals - Public signals
   * @returns {Promise<Object>} - Transaction result
   */
  async requestVerification(credentialHash, verificationType, proof, publicSignals) {
    await this.initialize();
    
    if (!this.contracts.vcVerifier) {
      throw new Error('VCVerifier contract not initialized');
    }

    try {
      const tx = await this.contracts.vcVerifier.requestVerification(
        credentialHash,
        verificationType,
        proof,
        publicSignals,
        {
          gasLimit: blockchain.gasConfig.gasLimit,
          gasPrice: blockchain.gasConfig.gasPrice
        }
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to request verification:', error);
      throw new Error(`Verification request failed: ${error.message}`);
    }
  }

  /**
   * Get IdentityRegistry contract ABI
   * @returns {Array} - Contract ABI
   */
  getIdentityRegistryABI() {
    // Simplified ABI - in production, load from build artifacts
    return [
      'function registerIdentity(bytes32 credentialHash, string memory metadataURI) external',
      'function getIdentityByWallet(address wallet) external view returns (uint256, bytes32, uint256, bool, string memory)',
      'function hasActiveIdentity(address wallet) external view returns (bool)',
      'function verifyCredentialHash(bytes32 credentialHash) external view returns (bool)',
      'event IdentityRegistered(uint256 indexed identityId, address indexed wallet, bytes32 credentialHash, uint256 timestamp)'
    ];
  }

  /**
   * Get ReputationScore contract ABI
   * @returns {Array} - Contract ABI
   */
  getReputationScoreABI() {
    return [
      'function issueReputationEvent(address targetWallet, int256 scoreChange, string memory eventType, string memory description, bytes32 proofHash) external',
      'function getReputationData(address wallet) external view returns (uint256, uint256, uint256, uint256, uint256, bool)',
      'function addAuthorizedIssuer(address issuer) external',
      'event ReputationEventIssued(uint256 indexed eventId, address indexed targetWallet, address indexed issuerWallet, int256 scoreChange, string eventType, uint256 newTotalScore, uint256 newTrustLevel)'
    ];
  }

  /**
   * Get VCVerifier contract ABI
   * @returns {Array} - Contract ABI
   */
  getVCVerifierABI() {
    return [
      'function requestVerification(bytes32 credentialHash, string memory verificationType, uint256[8] memory proof, uint256[2] memory publicSignals) external',
      'function completeVerification(uint256 requestId, bool isVerified, bytes32 verificationHash) external',
      'function getVerificationRequest(uint256 requestId) external view returns (tuple(uint256, address, bytes32, uint256[8], uint256[2], bool, uint256, string, bytes32))',
      'event VerificationRequested(uint256 indexed requestId, address indexed requester, bytes32 credentialHash, string verificationType, uint256 timestamp)'
    ];
  }

  /**
   * Get current network information
   * @returns {Promise<Object>} - Network info
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        name: network.name,
        chainId: network.chainId,
        blockNumber,
        gasPrice: gasPrice.toString()
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error(`Failed to retrieve network information: ${error.message}`);
    }
  }
}

module.exports = new BlockchainService();
