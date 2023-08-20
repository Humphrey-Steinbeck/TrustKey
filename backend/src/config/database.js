const { ethers } = require('ethers');
const { create } = require('ipfs-http-client');

// Blockchain configuration
const blockchainConfig = {
  // Ethereum network configuration
  networks: {
    localhost: {
      url: process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
      chainId: 1337,
      name: 'localhost'
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      chainId: 11155111,
      name: 'sepolia'
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      chainId: 1,
      name: 'mainnet'
    }
  },
  
  // Contract addresses (will be set after deployment)
  contracts: {
    IdentityRegistry: process.env.IDENTITY_REGISTRY_ADDRESS || '',
    ReputationScore: process.env.REPUTATION_SCORE_ADDRESS || '',
    VCVerifier: process.env.VC_VERIFIER_ADDRESS || ''
  },
  
  // Private key for contract interactions
  privateKey: process.env.PRIVATE_KEY || '',
  
  // Gas configuration
  gasConfig: {
    gasLimit: 500000,
    gasPrice: ethers.utils.parseUnits('20', 'gwei')
  }
};

// IPFS configuration
const ipfsConfig = {
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'http',
  timeout: 10000
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'trustkey-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

// CORS configuration
const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
};

// Initialize providers and clients
let provider;
let wallet;
let ipfsClient;

try {
  // Initialize Ethereum provider
  const networkName = process.env.NETWORK || 'localhost';
  const network = blockchainConfig.networks[networkName];
  
  if (network) {
    provider = new ethers.providers.JsonRpcProvider(network.url);
    console.log(`Connected to ${networkName} network: ${network.url}`);
  } else {
    throw new Error(`Network ${networkName} not configured`);
  }
  
  // Initialize wallet if private key is provided
  if (blockchainConfig.privateKey) {
    wallet = new ethers.Wallet(blockchainConfig.privateKey, provider);
    console.log(`Wallet initialized: ${wallet.address}`);
  }
  
  // Initialize IPFS client
  ipfsClient = create({
    host: ipfsConfig.host,
    port: ipfsConfig.port,
    protocol: ipfsConfig.protocol,
    timeout: ipfsConfig.timeout
  });
  
  console.log(`IPFS client initialized: ${ipfsConfig.protocol}://${ipfsConfig.host}:${ipfsConfig.port}`);
  
} catch (error) {
  console.error('Configuration initialization error:', error.message);
}

// Export configuration
module.exports = {
  blockchain: blockchainConfig,
  ipfs: ipfsConfig,
  jwt: jwtConfig,
  rateLimit: rateLimitConfig,
  cors: corsConfig,
  provider,
  wallet,
  ipfsClient
};
