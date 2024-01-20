const snarkjs = require('snarkjs');
const crypto = require('crypto');
const { ethers } = require('ethers');

/**
 * Zero-Knowledge Proof Service
 * Handles ZKP generation and verification for credential proofs
 */
class ZKPService {
  constructor() {
    this.circuits = new Map();
    this.trustedSetup = null;
  }

  /**
   * Generate ZKP proof for credential verification
   * @param {Object} credential - Verifiable credential
   * @param {Object} privateInputs - Private inputs for the proof
   * @param {string} circuitType - Type of circuit to use
   * @returns {Promise<Object>} - ZKP proof and public signals
   */
  async generateProof(credential, privateInputs, circuitType = 'credential_verification') {
    try {
      // Load circuit if not already loaded
      if (!this.circuits.has(circuitType)) {
        await this.loadCircuit(circuitType);
      }

      const circuit = this.circuits.get(circuitType);
      
      // Prepare inputs for the circuit
      const inputs = this.prepareCircuitInputs(credential, privateInputs, circuitType);
      
      // Generate witness
      const witness = circuit.calculateWitness(inputs);
      
      // Generate proof
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        this.trustedSetup,
        witness
      );

      // Format proof for smart contract
      const formattedProof = this.formatProofForContract(proof);
      
      return {
        proof: formattedProof,
        publicSignals: publicSignals.map(signal => signal.toString()),
        circuitType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to generate ZKP proof:', error);
      throw new Error(`ZKP proof generation failed: ${error.message}`);
    }
  }

  /**
   * Verify ZKP proof
   * @param {Object} proof - ZKP proof
   * @param {Array} publicSignals - Public signals
   * @param {string} circuitType - Type of circuit used
   * @returns {Promise<boolean>} - Verification result
   */
  async verifyProof(proof, publicSignals, circuitType = 'credential_verification') {
    try {
      // Load circuit if not already loaded
      if (!this.circuits.has(circuitType)) {
        await this.loadCircuit(circuitType);
      }

      // Format proof for verification
      const formattedProof = this.formatProofForVerification(proof);
      
      // Verify proof
      const isValid = await snarkjs.groth16.verify(
        this.trustedSetup,
        publicSignals,
        formattedProof
      );

      return isValid;
    } catch (error) {
      console.error('Failed to verify ZKP proof:', error);
      return false;
    }
  }

  /**
   * Load circuit and trusted setup
   * @param {string} circuitType - Type of circuit to load
   */
  async loadCircuit(circuitType) {
    try {
      // In a real implementation, these would be loaded from files
      // For now, we'll create mock circuits
      const circuit = this.createMockCircuit(circuitType);
      this.circuits.set(circuitType, circuit);
      
      // Load trusted setup (in production, this would be from files)
      this.trustedSetup = await this.loadTrustedSetup(circuitType);
    } catch (error) {
      console.error(`Failed to load circuit ${circuitType}:`, error);
      throw new Error(`Circuit loading failed: ${error.message}`);
    }
  }

  /**
   * Create mock circuit for demonstration
   * @param {string} circuitType - Type of circuit
   * @returns {Object} - Mock circuit
   */
  createMockCircuit(circuitType) {
    return {
      calculateWitness: (inputs) => {
        // Mock witness calculation
        return {
          inputs: inputs,
          outputs: [1, 2], // Mock public signals
          intermediate: []
        };
      }
    };
  }

  /**
   * Load trusted setup (mock implementation)
   * @param {string} circuitType - Type of circuit
   * @returns {Promise<Object>} - Trusted setup
   */
  async loadTrustedSetup(circuitType) {
    // In a real implementation, this would load the actual trusted setup
    return {
      vk: {
        protocol: 'groth16',
        curve: 'bn128',
        nPublic: 2,
        vk_alpha_1: [1, 2],
        vk_beta_2: [[1, 2], [3, 4]],
        vk_gamma_2: [[1, 2], [3, 4]],
        vk_delta_2: [[1, 2], [3, 4]],
        vk_alphabeta_12: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]],
        IC: [[1, 2], [3, 4], [5, 6]]
      }
    };
  }

  /**
   * Prepare inputs for circuit
   * @param {Object} credential - Verifiable credential
   * @param {Object} privateInputs - Private inputs
   * @param {string} circuitType - Circuit type
   * @returns {Object} - Circuit inputs
   */
  prepareCircuitInputs(credential, privateInputs, circuitType) {
    switch (circuitType) {
      case 'credential_verification':
        return this.prepareCredentialVerificationInputs(credential, privateInputs);
      case 'age_verification':
        return this.prepareAgeVerificationInputs(credential, privateInputs);
      case 'kyc_verification':
        return this.prepareKYCVerificationInputs(credential, privateInputs);
      default:
        throw new Error(`Unknown circuit type: ${circuitType}`);
    }
  }

  /**
   * Prepare inputs for credential verification circuit
   * @param {Object} credential - Verifiable credential
   * @param {Object} privateInputs - Private inputs
   * @returns {Object} - Circuit inputs
   */
  prepareCredentialVerificationInputs(credential, privateInputs) {
    // Hash the credential
    const credentialHash = this.hashCredential(credential);
    
    // Hash private inputs
    const privateHash = this.hashPrivateInputs(privateInputs);
    
    return {
      credentialHash: credentialHash,
      privateHash: privateHash,
      issuerPublicKey: privateInputs.issuerPublicKey || '0x0',
      subjectPublicKey: privateInputs.subjectPublicKey || '0x0',
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Prepare inputs for age verification circuit
   * @param {Object} credential - Verifiable credential
   * @param {Object} privateInputs - Private inputs
   * @returns {Object} - Circuit inputs
   */
  prepareAgeVerificationInputs(credential, privateInputs) {
    const credentialHash = this.hashCredential(credential);
    const birthDate = new Date(privateInputs.dateOfBirth);
    const currentDate = new Date();
    const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    return {
      credentialHash: credentialHash,
      age: age,
      minimumAge: privateInputs.minimumAge || 18,
      birthDateHash: this.hashString(privateInputs.dateOfBirth),
      currentDateHash: this.hashString(currentDate.toISOString())
    };
  }

  /**
   * Prepare inputs for KYC verification circuit
   * @param {Object} credential - Verifiable credential
   * @param {Object} privateInputs - Private inputs
   * @returns {Object} - Circuit inputs
   */
  prepareKYCVerificationInputs(credential, privateInputs) {
    const credentialHash = this.hashCredential(credential);
    
    return {
      credentialHash: credentialHash,
      nameHash: this.hashString(privateInputs.name),
      emailHash: this.hashString(privateInputs.email),
      phoneHash: this.hashString(privateInputs.phone || ''),
      documentHash: this.hashString(privateInputs.documentNumber || ''),
      kycProviderHash: this.hashString(privateInputs.kycProvider || '')
    };
  }

  /**
   * Format proof for smart contract
   * @param {Object} proof - ZKP proof
   * @returns {Array} - Formatted proof array
   */
  formatProofForContract(proof) {
    // Convert proof to format expected by smart contract
    return [
      proof.pi_a[0],
      proof.pi_a[1],
      proof.pi_b[0][0],
      proof.pi_b[0][1],
      proof.pi_b[1][0],
      proof.pi_b[1][1],
      proof.pi_c[0],
      proof.pi_c[1]
    ];
  }

  /**
   * Format proof for verification
   * @param {Array} proof - Formatted proof array
   * @returns {Object} - Proof object for verification
   */
  formatProofForVerification(proof) {
    return {
      pi_a: [proof[0], proof[1]],
      pi_b: [[proof[2], proof[3]], [proof[4], proof[5]]],
      pi_c: [proof[6], proof[7]]
    };
  }

  /**
   * Hash credential data
   * @param {Object} credential - Verifiable credential
   * @returns {string} - Hash of credential
   */
  hashCredential(credential) {
    const credentialString = JSON.stringify(credential, Object.keys(credential).sort());
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(credentialString));
  }

  /**
   * Hash private inputs
   * @param {Object} privateInputs - Private inputs
   * @returns {string} - Hash of private inputs
   */
  hashPrivateInputs(privateInputs) {
    const inputsString = JSON.stringify(privateInputs, Object.keys(privateInputs).sort());
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(inputsString));
  }

  /**
   * Hash string data
   * @param {string} data - String to hash
   * @returns {string} - Hash of string
   */
  hashString(data) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
  }

  /**
   * Generate commitment for private data
   * @param {Object} privateData - Private data to commit to
   * @param {string} secret - Secret for commitment
   * @returns {string} - Commitment hash
   */
  generateCommitment(privateData, secret) {
    const dataString = JSON.stringify(privateData, Object.keys(privateData).sort());
    const commitmentString = dataString + secret;
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(commitmentString));
  }

  /**
   * Verify commitment
   * @param {Object} privateData - Private data
   * @param {string} secret - Secret used in commitment
   * @param {string} commitment - Commitment to verify
   * @returns {boolean} - Verification result
   */
  verifyCommitment(privateData, secret, commitment) {
    const expectedCommitment = this.generateCommitment(privateData, secret);
    return expectedCommitment === commitment;
  }

  /**
   * Generate random secret for commitment
   * @returns {string} - Random secret
   */
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get available circuit types
   * @returns {Array} - Available circuit types
   */
  getAvailableCircuits() {
    return [
      'credential_verification',
      'age_verification',
      'kyc_verification',
      'reputation_verification',
      'membership_verification'
    ];
  }

  /**
   * Get circuit information
   * @param {string} circuitType - Circuit type
   * @returns {Object} - Circuit information
   */
  getCircuitInfo(circuitType) {
    const circuitInfo = {
      credential_verification: {
        name: 'Credential Verification',
        description: 'Verify ownership of a verifiable credential',
        inputs: ['credentialHash', 'privateHash', 'issuerPublicKey', 'subjectPublicKey'],
        outputs: ['isValid', 'timestamp']
      },
      age_verification: {
        name: 'Age Verification',
        description: 'Verify age without revealing exact birth date',
        inputs: ['credentialHash', 'age', 'minimumAge', 'birthDateHash'],
        outputs: ['isOfAge', 'ageRange']
      },
      kyc_verification: {
        name: 'KYC Verification',
        description: 'Verify KYC status without revealing personal details',
        inputs: ['credentialHash', 'nameHash', 'emailHash', 'phoneHash'],
        outputs: ['isKYCVerified', 'verificationLevel']
      }
    };

    return circuitInfo[circuitType] || null;
  }
}

module.exports = new ZKPService();
