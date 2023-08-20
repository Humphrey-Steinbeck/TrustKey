const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * Verifiable Credential Model
 * Implements W3C Verifiable Credentials standard
 */
class VerifiableCredential {
  constructor(data) {
    this.context = [
      'https://www.w3.org/2018/credentials/v1',
      'https://trustkey.io/credentials/v1'
    ];
    this.type = ['VerifiableCredential', data.type || 'TrustKeyCredential'];
    this.issuer = data.issuer;
    this.issuanceDate = new Date().toISOString();
    this.expirationDate = data.expirationDate;
    this.credentialSubject = data.credentialSubject;
    this.proof = null;
    this.id = data.id || this.generateId();
  }

  /**
   * Generate a unique credential ID
   */
  generateId() {
    return `urn:trustkey:credential:${crypto.randomUUID()}`;
  }

  /**
   * Add proof to the credential
   * @param {Object} proof - The proof object
   */
  addProof(proof) {
    this.proof = {
      type: 'EcdsaSecp256k1Signature2019',
      created: new Date().toISOString(),
      verificationMethod: proof.verificationMethod,
      proofPurpose: 'assertionMethod',
      jws: proof.jws,
      ...proof
    };
  }

  /**
   * Generate credential hash for blockchain storage
   * @returns {string} - Keccak256 hash of the credential
   */
  generateHash() {
    const credentialData = {
      id: this.id,
      type: this.type,
      issuer: this.issuer,
      issuanceDate: this.issuanceDate,
      credentialSubject: this.credentialSubject
    };
    
    const credentialString = JSON.stringify(credentialData, Object.keys(credentialData).sort());
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(credentialString));
  }

  /**
   * Validate credential structure
   * @returns {Object} - Validation result
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('Credential ID is required');
    }

    if (!this.type || !Array.isArray(this.type)) {
      errors.push('Credential type must be an array');
    }

    if (!this.issuer) {
      errors.push('Issuer is required');
    }

    if (!this.issuanceDate) {
      errors.push('Issuance date is required');
    }

    if (!this.credentialSubject) {
      errors.push('Credential subject is required');
    }

    if (this.expirationDate && new Date(this.expirationDate) <= new Date()) {
      errors.push('Credential has expired');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert credential to JSON-LD format
   * @returns {Object} - JSON-LD representation
   */
  toJsonLd() {
    return {
      '@context': this.context,
      id: this.id,
      type: this.type,
      issuer: this.issuer,
      issuanceDate: this.issuanceDate,
      expirationDate: this.expirationDate,
      credentialSubject: this.credentialSubject,
      proof: this.proof
    };
  }

  /**
   * Create a credential from JSON-LD data
   * @param {Object} jsonLd - JSON-LD credential data
   * @returns {VerifiableCredential} - Credential instance
   */
  static fromJsonLd(jsonLd) {
    const credential = new VerifiableCredential({
      id: jsonLd.id,
      type: jsonLd.type[1], // Get the specific type, not 'VerifiableCredential'
      issuer: jsonLd.issuer,
      expirationDate: jsonLd.expirationDate,
      credentialSubject: jsonLd.credentialSubject
    });

    credential.issuanceDate = jsonLd.issuanceDate;
    credential.proof = jsonLd.proof;

    return credential;
  }
}

/**
 * Credential Subject Model
 */
class CredentialSubject {
  constructor(data) {
    this.id = data.id; // DID or wallet address
    this.type = data.type || 'Person';
    this.properties = data.properties || {};
  }

  /**
   * Add property to credential subject
   * @param {string} key - Property key
   * @param {*} value - Property value
   */
  addProperty(key, value) {
    this.properties[key] = value;
  }

  /**
   * Get property value
   * @param {string} key - Property key
   * @returns {*} - Property value
   */
  getProperty(key) {
    return this.properties[key];
  }

  /**
   * Validate credential subject
   * @returns {Object} - Validation result
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('Subject ID is required');
    }

    if (!this.type) {
      errors.push('Subject type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Credential Issuer Model
 */
class CredentialIssuer {
  constructor(data) {
    this.id = data.id; // DID or wallet address
    this.name = data.name;
    this.type = data.type || 'Organization';
    this.verificationMethod = data.verificationMethod;
  }

  /**
   * Validate issuer
   * @returns {Object} - Validation result
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('Issuer ID is required');
    }

    if (!this.name) {
      errors.push('Issuer name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = {
  VerifiableCredential,
  CredentialSubject,
  CredentialIssuer
};
