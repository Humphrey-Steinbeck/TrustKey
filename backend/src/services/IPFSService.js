const { ipfsClient } = require('../config/database');
const { ethers } = require('ethers');

/**
 * IPFS Service for storing and retrieving credential metadata
 */
class IPFSService {
  constructor() {
    this.client = ipfsClient;
  }

  /**
   * Upload metadata to IPFS
   * @param {Object} metadata - Metadata object to upload
   * @returns {Promise<string>} - IPFS hash/URI
   */
  async uploadMetadata(metadata) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata, null, 2);
      
      // Upload to IPFS
      const result = await this.client.add(metadataString);
      const ipfsHash = result.path;
      
      // Return IPFS URI
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('Failed to upload metadata to IPFS:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve metadata from IPFS
   * @param {string} ipfsURI - IPFS URI (ipfs://hash or just hash)
   * @returns {Promise<Object>} - Metadata object
   */
  async getMetadata(ipfsURI) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      // Extract hash from URI
      const hash = ipfsURI.replace('ipfs://', '');
      
      // Retrieve from IPFS
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      // Combine chunks and parse JSON
      const metadataString = Buffer.concat(chunks).toString();
      return JSON.parse(metadataString);
    } catch (error) {
      console.error('Failed to retrieve metadata from IPFS:', error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Upload file to IPFS
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Original filename
   * @returns {Promise<string>} - IPFS hash/URI
   */
  async uploadFile(fileBuffer, filename) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      const result = await this.client.add({
        path: filename,
        content: fileBuffer
      });
      
      return `ipfs://${result.path}`;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Pin content to IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Promise<boolean>} - Success status
   */
  async pinContent(ipfsHash) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      await this.client.pin.add(ipfsHash);
      return true;
    } catch (error) {
      console.error('Failed to pin content to IPFS:', error);
      return false;
    }
  }

  /**
   * Unpin content from IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Promise<boolean>} - Success status
   */
  async unpinContent(ipfsHash) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      await this.client.pin.rm(ipfsHash);
      return true;
    } catch (error) {
      console.error('Failed to unpin content from IPFS:', error);
      return false;
    }
  }

  /**
   * Get IPFS node information
   * @returns {Promise<Object>} - Node info
   */
  async getNodeInfo() {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      const id = await this.client.id();
      return {
        id: id.id,
        addresses: id.addresses,
        agentVersion: id.agentVersion,
        protocolVersion: id.protocolVersion
      };
    } catch (error) {
      console.error('Failed to get IPFS node info:', error);
      throw new Error(`Failed to get node info: ${error.message}`);
    }
  }

  /**
   * Check if IPFS is accessible
   * @returns {Promise<boolean>} - Accessibility status
   */
  async isAccessible() {
    try {
      if (!this.client) {
        return false;
      }

      await this.client.id();
      return true;
    } catch (error) {
      console.error('IPFS not accessible:', error);
      return false;
    }
  }
}

module.exports = new IPFSService();
