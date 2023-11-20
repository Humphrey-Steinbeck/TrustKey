// TrustKey Constants

const CREDENTIAL_TYPES = {
  IDENTITY: 'IdentityCredential',
  EDUCATION: 'EducationCredential',
  PROFESSIONAL: 'ProfessionalCredential',
  MEMBERSHIP: 'MembershipCredential',
  CERTIFICATION: 'CertificationCredential',
};

const VERIFICATION_TYPES = {
  IDENTITY: 'identity_verification',
  AGE: 'age_verification',
  KYC: 'kyc_verification',
  REPUTATION: 'reputation_verification',
  MEMBERSHIP: 'membership_verification',
};

const TRUST_LEVELS = {
  1: { label: 'Newcomer', color: 'gray', threshold: 0 },
  2: { label: 'Established', color: 'blue', threshold: 100 },
  3: { label: 'Trusted', color: 'green', threshold: 300 },
  4: { label: 'Highly Trusted', color: 'purple', threshold: 600 },
  5: { label: 'Expert', color: 'yellow', threshold: 1000 },
};

const REPUTATION_EVENTS = {
  VERIFICATION_COMPLETED: 'verification_completed',
  TRANSACTION_COMPLETED: 'transaction_completed',
  REVIEW_POSITIVE: 'review_positive',
  REVIEW_NEGATIVE: 'review_negative',
  VERIFICATION_FAILED: 'verification_failed',
  MEMBERSHIP_GRANTED: 'membership_granted',
  CERTIFICATION_EARNED: 'certification_earned',
};

const CIRCUIT_TYPES = {
  CREDENTIAL_VERIFICATION: 'credential_verification',
  AGE_VERIFICATION: 'age_verification',
  KYC_VERIFICATION: 'kyc_verification',
  REPUTATION_VERIFICATION: 'reputation_verification',
  MEMBERSHIP_VERIFICATION: 'membership_verification',
};

const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  IPFS_ERROR: 'IPFS_ERROR',
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
  IDENTITY: { windowMs: 5 * 60 * 1000, max: 20 },
  READ: { windowMs: 1 * 60 * 1000, max: 100 },
};

const VALIDATION_RULES = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
  IPFS_HASH: /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/,
  CREDENTIAL_HASH: /^0x[a-fA-F0-9]{64}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,50}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'trustkey_access_token',
  REFRESH_TOKEN: 'trustkey_refresh_token',
  USER_PREFERENCES: 'trustkey_user_preferences',
  WALLET_CONNECTION: 'trustkey_wallet_connection',
  THEME: 'trustkey_theme',
  LANGUAGE: 'trustkey_language',
};

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  IDENTITY: {
    GET: '/api/identity',
    REGISTER: '/api/identity/register',
    UPDATE: '/api/identity/update',
    DEACTIVATE: '/api/identity/deactivate',
    STATUS: '/api/identity/status',
  },
  CREDENTIAL: {
    GENERATE: '/api/credential/generate',
    VERIFY: '/api/credential/verify',
    VALIDATE: '/api/credential/validate',
    REVOKE: '/api/credential/revoke',
    STATUS: '/api/credential/status',
  },
  REPUTATION: {
    GET: '/api/reputation',
    ISSUE_EVENT: '/api/reputation/issue-event',
    EVENTS: '/api/reputation/events',
    LEADERBOARD: '/api/reputation/stats/leaderboard',
  },
  VERIFICATION: {
    REQUEST: '/api/verification/request',
    GENERATE_PROOF: '/api/verification/generate-proof',
    VERIFY_PROOF: '/api/verification/verify-proof',
    CIRCUITS: '/api/verification/circuits',
  },
};

const NETWORK_CONFIG = {
  LOCALHOST: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    blockExplorer: '',
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
  },
};

const APP_CONFIG = {
  name: 'TrustKey',
  version: '1.0.0',
  description: 'Decentralized Identity and Reputation System',
  website: 'https://trustkey.io',
  github: 'https://github.com/Humphrey-Steinbeck/TrustKey',
  discord: 'https://discord.gg/trustkey',
  twitter: 'https://twitter.com/trustkey',
};

const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 500,
  PAGINATION_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

module.exports = {
  CREDENTIAL_TYPES,
  VERIFICATION_TYPES,
  TRUST_LEVELS,
  REPUTATION_EVENTS,
  CIRCUIT_TYPES,
  ERROR_CODES,
  HTTP_STATUS,
  RATE_LIMITS,
  VALIDATION_RULES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  NETWORK_CONFIG,
  APP_CONFIG,
  UI_CONFIG,
};
