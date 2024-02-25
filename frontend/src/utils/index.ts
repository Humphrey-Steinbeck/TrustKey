// TrustKey Utilities Index

// Export all utility functions and classes
export * from './constants';
export * from './helpers';
export * from './validation';
export * from './storage';

// Re-export commonly used utilities for convenience
export {
  formatAddress,
  formatNumber,
  formatReputation,
  formatRelativeTime,
  formatDate,
  isValidAddress,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidIPFSHash,
  generateRandomString,
  generateCredentialId,
  generateVerificationId,
  hashString,
  formatBytes,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  getCredentialTypeDisplayName,
  calculateTrustScore,
  getTrustLevelColor,
  copyToClipboard,
  downloadFile,
  parseErrorMessage,
  retry,
} from './helpers';

export {
  createValidator,
  validateUserRegistration,
  validateCredentialData,
  validateIdentityData,
  validateReputationEvent,
  validateVerificationRequest,
  validateApiRequest,
  validateFormData,
  validateJsonSchema,
} from './validation';

export {
  StorageManager,
  TokenManager,
  UserPreferencesManager,
  WalletConnectionManager,
  storage,
  sessionStorage,
  memoryStorage,
  tokenManager,
  userPreferencesManager,
  walletConnectionManager,
  clearAllData,
  STORAGE_KEYS,
} from './storage';

export {
  APP_CONFIG,
  NETWORK_CONFIG,
  API_ENDPOINTS,
  CREDENTIAL_TYPES,
  VERIFICATION_TYPES,
  TRUST_LEVELS,
  REPUTATION_EVENTS,
  CIRCUIT_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  UI_CONFIG,
  RATE_LIMITS,
} from './constants';
