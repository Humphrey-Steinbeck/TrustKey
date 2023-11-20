// TrustKey Validation Utility Functions

const { ethers } = require('ethers');

/**
 * Validate Ethereum address
 */
function isValidEthereumAddress(address) {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhoneNumber(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate IPFS hash
 */
function isValidIPFSHash(hash) {
  const ipfsRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  return ipfsRegex.test(hash);
}

/**
 * Validate credential hash
 */
function isValidCredentialHash(hash) {
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  return hashRegex.test(hash);
}

/**
 * Validate DID format
 */
function isValidDID(did) {
  const didRegex = /^did:trustkey:[a-zA-Z0-9]{42}$/;
  return didRegex.test(did);
}

/**
 * Validate username format
 */
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate JSON string
 */
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate date string
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate future date
 */
function isFutureDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date > new Date();
}

/**
 * Validate past date
 */
function isPastDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date < new Date();
}

/**
 * Validate numeric range
 */
function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate array length
 */
function isValidArrayLength(arr, minLength, maxLength) {
  return Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength;
}

/**
 * Validate object properties
 */
function hasRequiredProperties(obj, requiredProps) {
  return requiredProps.every(prop => obj.hasOwnProperty(prop));
}

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  return str.toString().trim().replace(/[<>]/g, '');
}

/**
 * Validate file extension
 */
function isValidFileExtension(filename, allowedExtensions) {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
}

/**
 * Validate file size
 */
function isValidFileSize(size, maxSize) {
  return size <= maxSize;
}

/**
 * Validate hex color
 */
function isValidHexColor(color) {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate JWT token format
 */
function isValidJWTFormat(token) {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(token);
}

/**
 * Validate base64 string
 */
function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
}

/**
 * Validate reputation score
 */
function isValidReputationScore(score) {
  return isInRange(score, 0, 1000);
}

/**
 * Validate credential type
 */
function isValidCredentialType(type) {
  const validTypes = [
    'IdentityCredential',
    'EducationCredential', 
    'ProfessionalCredential',
    'MembershipCredential',
    'CertificationCredential'
  ];
  return validTypes.includes(type);
}

/**
 * Validate verification type
 */
function isValidVerificationType(type) {
  const validTypes = [
    'identity_verification',
    'age_verification',
    'kyc_verification',
    'reputation_verification',
    'membership_verification'
  ];
  return validTypes.includes(type);
}

module.exports = {
  isValidEthereumAddress,
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
  isValidIPFSHash,
  isValidCredentialHash,
  isValidDID,
  isValidUsername,
  isValidPassword,
  isValidJSON,
  isValidDate,
  isFutureDate,
  isPastDate,
  isInRange,
  isValidArrayLength,
  hasRequiredProperties,
  sanitizeString,
  isValidFileExtension,
  isValidFileSize,
  isValidHexColor,
  isValidUUID,
  isValidJWTFormat,
  isValidBase64,
  isValidReputationScore,
  isValidCredentialType,
  isValidVerificationType,
};
