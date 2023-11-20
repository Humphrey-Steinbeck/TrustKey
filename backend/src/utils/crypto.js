// TrustKey Crypto Utility Functions

const crypto = require('crypto');
const { ethers } = require('ethers');

/**
 * Generate random salt
 */
function generateSalt(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password with salt
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

/**
 * Verify password
 */
function verifyPassword(password, hash, salt) {
  const passwordHash = hashPassword(password, salt);
  return passwordHash === hash;
}

/**
 * Generate secure random string
 */
function generateSecureRandom(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Encrypt data with AES-256-GCM
 */
function encryptData(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', key);
  cipher.setAAD(Buffer.from('trustkey', 'utf8'));
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt data with AES-256-GCM
 */
function decryptData(encryptedData, key) {
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  decipher.setAAD(Buffer.from('trustkey', 'utf8'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate Merkle tree root
 */
function generateMerkleRoot(leaves) {
  if (leaves.length === 0) return null;
  if (leaves.length === 1) return leaves[0];
  
  const hashedLeaves = leaves.map(leaf => 
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(leaf))
  );
  
  let currentLevel = hashedLeaves;
  
  while (currentLevel.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left;
      
      const combined = ethers.utils.solidityPack(['bytes32', 'bytes32'], [left, right]);
      const hash = ethers.utils.keccak256(combined);
      
      nextLevel.push(hash);
    }
    
    currentLevel = nextLevel;
  }
  
  return currentLevel[0];
}

/**
 * Generate Merkle proof
 */
function generateMerkleProof(leaves, index) {
  if (index >= leaves.length) return null;
  
  const hashedLeaves = leaves.map(leaf => 
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(leaf))
  );
  
  const proof = [];
  let currentIndex = index;
  let currentLevel = hashedLeaves;
  
  while (currentLevel.length > 1) {
    const nextLevel = [];
    const isLeftNode = currentIndex % 2 === 0;
    
    if (isLeftNode && currentIndex + 1 < currentLevel.length) {
      proof.push(currentLevel[currentIndex + 1]);
    } else if (!isLeftNode) {
      proof.push(currentLevel[currentIndex - 1]);
    }
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left;
      
      const combined = ethers.utils.solidityPack(['bytes32', 'bytes32'], [left, right]);
      const hash = ethers.utils.keccak256(combined);
      
      nextLevel.push(hash);
    }
    
    currentLevel = nextLevel;
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  return proof;
}

/**
 * Verify Merkle proof
 */
function verifyMerkleProof(leaf, proof, root) {
  let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(leaf));
  
  for (const proofElement of proof) {
    const combined = ethers.utils.solidityPack(['bytes32', 'bytes32'], [hash, proofElement]);
    hash = ethers.utils.keccak256(combined);
  }
  
  return hash === root;
}

/**
 * Generate ECDSA signature
 */
function generateSignature(message, privateKey) {
  const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(ethers.utils.arrayify(messageHash));
}

/**
 * Verify ECDSA signature
 */
async function verifySignature(message, signature, address) {
  try {
    const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
    const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * Generate commitment
 */
function generateCommitment(value, salt) {
  const combined = ethers.utils.solidityPack(['uint256', 'bytes32'], [value, salt]);
  return ethers.utils.keccak256(combined);
}

/**
 * Verify commitment
 */
function verifyCommitment(value, salt, commitment) {
  const computedCommitment = generateCommitment(value, salt);
  return computedCommitment === commitment;
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSecureRandom,
  encryptData,
  decryptData,
  generateMerkleRoot,
  generateMerkleProof,
  verifyMerkleProof,
  generateSignature,
  verifySignature,
  generateCommitment,
  verifyCommitment,
};
