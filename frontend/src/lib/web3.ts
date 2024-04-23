// TrustKey Web3 Library

import { ethers } from 'ethers';
import { WEB3_CONFIG, CONTRACT_ADDRESSES } from '../config';
import { parseErrorMessage } from '../utils/helpers';

// Contract ABIs (simplified for demo)
const IDENTITY_REGISTRY_ABI = [
  'function registerIdentity(bytes32 identityHash) external',
  'function isIdentityRegistered(address user) external view returns (bool)',
  'function getIdentityHash(address user) external view returns (bytes32)',
  'function deactivateIdentity() external',
  'event IdentityRegistered(address indexed user, bytes32 indexed identityHash)',
  'event IdentityDeactivated(address indexed user)',
];

const REPUTATION_SCORE_ABI = [
  'function issueReputationEvent(address user, string memory eventType, int256 value, string memory description) external',
  'function getReputationScore(address user) external view returns (uint256)',
  'function getReputationLevel(address user) external view returns (uint8)',
  'function getReputationEvents(address user) external view returns (tuple(string eventType, int256 value, string description, uint256 timestamp)[])',
  'event ReputationEventIssued(address indexed user, string indexed eventType, int256 value, string description)',
];

const VC_VERIFIER_ABI = [
  'function verifyProof(bytes32[8] memory proof, uint256[2] memory publicInputs) external view returns (bool)',
  'function verifyCredential(bytes32 credentialHash, bytes memory signature) external view returns (bool)',
  'function revokeCredential(bytes32 credentialHash) external',
  'function isCredentialRevoked(bytes32 credentialHash) external view returns (bool)',
  'event ProofVerified(bytes32 indexed proofHash, bool verified)',
  'event CredentialRevoked(bytes32 indexed credentialHash)',
];

// Web3 service class
export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: {
    identityRegistry?: ethers.Contract;
    reputationScore?: ethers.Contract;
    vcVerifier?: ethers.Contract;
  } = {};

  constructor() {
    this.initializeProvider();
  }

  // Initialize Web3 provider
  private initializeProvider(): void {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.initializeContracts();
    }
  }

  // Initialize smart contracts
  private initializeContracts(): void {
    if (!this.provider) return;

    try {
      this.contracts.identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        IDENTITY_REGISTRY_ABI,
        this.provider
      );

      this.contracts.reputationScore = new ethers.Contract(
        CONTRACT_ADDRESSES.REPUTATION_SCORE,
        REPUTATION_SCORE_ABI,
        this.provider
      );

      this.contracts.vcVerifier = new ethers.Contract(
        CONTRACT_ADDRESSES.VC_VERIFIER,
        VC_VERIFIER_ABI,
        this.provider
      );
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }

  // Connect to wallet
  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }

    try {
      await this.provider.send('eth_requestAccounts', []);
      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();

      // Update contracts with signer
      this.updateContractsWithSigner();

      return address;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Update contracts with signer
  private updateContractsWithSigner(): void {
    if (!this.signer) return;

    try {
      if (this.contracts.identityRegistry) {
        this.contracts.identityRegistry = this.contracts.identityRegistry.connect(this.signer);
      }
      if (this.contracts.reputationScore) {
        this.contracts.reputationScore = this.contracts.reputationScore.connect(this.signer);
      }
      if (this.contracts.vcVerifier) {
        this.contracts.vcVerifier = this.contracts.vcVerifier.connect(this.signer);
      }
    } catch (error) {
      console.error('Error updating contracts with signer:', error);
    }
  }

  // Get current account
  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  // Get network info
  async getNetwork(): Promise<{ chainId: number; name: string } | null> {
    if (!this.provider) return null;

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name,
      };
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  // Switch network
  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        const networkConfig = this.getNetworkConfig(chainId);
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        }
      } else {
        throw new Error(parseErrorMessage(error));
      }
    }
  }

  // Get network configuration
  private getNetworkConfig(chainId: number): any {
    const networks = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io'],
      },
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      1337: {
        chainId: '0x539',
        chainName: 'Localhost',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['http://localhost:8545'],
        blockExplorerUrls: [],
      },
    };

    return networks[chainId as keyof typeof networks];
  }

  // Get account balance
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }

    try {
      const targetAddress = address || (await this.getCurrentAccount());
      if (!targetAddress) {
        throw new Error('No account available');
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Send transaction
  async sendTransaction(to: string, value: string, data?: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value),
        data,
      });

      return tx;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Identity Registry methods
  async registerIdentity(identityHash: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.contracts.identityRegistry) {
      throw new Error('Identity Registry contract not available');
    }

    try {
      const tx = await this.contracts.identityRegistry.registerIdentity(identityHash);
      return tx;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async isIdentityRegistered(user: string): Promise<boolean> {
    if (!this.contracts.identityRegistry) {
      throw new Error('Identity Registry contract not available');
    }

    try {
      return await this.contracts.identityRegistry.isIdentityRegistered(user);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async getIdentityHash(user: string): Promise<string> {
    if (!this.contracts.identityRegistry) {
      throw new Error('Identity Registry contract not available');
    }

    try {
      return await this.contracts.identityRegistry.getIdentityHash(user);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async deactivateIdentity(): Promise<ethers.providers.TransactionResponse> {
    if (!this.contracts.identityRegistry) {
      throw new Error('Identity Registry contract not available');
    }

    try {
      const tx = await this.contracts.identityRegistry.deactivateIdentity();
      return tx;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Reputation Score methods
  async issueReputationEvent(
    user: string,
    eventType: string,
    value: number,
    description: string
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.contracts.reputationScore) {
      throw new Error('Reputation Score contract not available');
    }

    try {
      const tx = await this.contracts.reputationScore.issueReputationEvent(
        user,
        eventType,
        value,
        description
      );
      return tx;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async getReputationScore(user: string): Promise<number> {
    if (!this.contracts.reputationScore) {
      throw new Error('Reputation Score contract not available');
    }

    try {
      const score = await this.contracts.reputationScore.getReputationScore(user);
      return score.toNumber();
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async getReputationLevel(user: string): Promise<number> {
    if (!this.contracts.reputationScore) {
      throw new Error('Reputation Score contract not available');
    }

    try {
      const level = await this.contracts.reputationScore.getReputationLevel(user);
      return level;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async getReputationEvents(user: string): Promise<Array<{
    eventType: string;
    value: number;
    description: string;
    timestamp: number;
  }>> {
    if (!this.contracts.reputationScore) {
      throw new Error('Reputation Score contract not available');
    }

    try {
      const events = await this.contracts.reputationScore.getReputationEvents(user);
      return events.map((event: any) => ({
        eventType: event.eventType,
        value: event.value.toNumber(),
        description: event.description,
        timestamp: event.timestamp.toNumber(),
      }));
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // VC Verifier methods
  async verifyProof(proof: string[], publicInputs: number[]): Promise<boolean> {
    if (!this.contracts.vcVerifier) {
      throw new Error('VC Verifier contract not available');
    }

    try {
      return await this.contracts.vcVerifier.verifyProof(proof, publicInputs);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async verifyCredential(credentialHash: string, signature: string): Promise<boolean> {
    if (!this.contracts.vcVerifier) {
      throw new Error('VC Verifier contract not available');
    }

    try {
      return await this.contracts.vcVerifier.verifyCredential(credentialHash, signature);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async revokeCredential(credentialHash: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.contracts.vcVerifier) {
      throw new Error('VC Verifier contract not available');
    }

    try {
      const tx = await this.contracts.vcVerifier.revokeCredential(credentialHash);
      return tx;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async isCredentialRevoked(credentialHash: string): Promise<boolean> {
    if (!this.contracts.vcVerifier) {
      throw new Error('VC Verifier contract not available');
    }

    try {
      return await this.contracts.vcVerifier.isCredentialRevoked(credentialHash);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Utility methods
  async waitForTransaction(txHash: string): Promise<ethers.providers.TransactionReceipt> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }

    try {
      return await this.provider.waitForTransaction(txHash);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async getTransaction(txHash: string): Promise<ethers.providers.TransactionResponse | null> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }

    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.providers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }

    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  // Event listeners
  onIdentityRegistered(callback: (user: string, identityHash: string) => void): void {
    if (!this.contracts.identityRegistry) return;

    this.contracts.identityRegistry.on('IdentityRegistered', callback);
  }

  onReputationEventIssued(callback: (user: string, eventType: string, value: number, description: string) => void): void {
    if (!this.contracts.reputationScore) return;

    this.contracts.reputationScore.on('ReputationEventIssued', callback);
  }

  onProofVerified(callback: (proofHash: string, verified: boolean) => void): void {
    if (!this.contracts.vcVerifier) return;

    this.contracts.vcVerifier.on('ProofVerified', callback);
  }

  // Remove event listeners
  removeAllListeners(): void {
    Object.values(this.contracts).forEach(contract => {
      if (contract) {
        contract.removeAllListeners();
      }
    });
  }
}

// Create singleton instance
export const web3Service = new Web3Service();

export default web3Service;
