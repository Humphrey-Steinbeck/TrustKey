// TrustKey Application Constants

export const APP_CONFIG = {
  name: 'TrustKey',
  version: '1.0.0',
  description: 'Decentralized Identity and Reputation System',
  website: 'https://trustkey.io',
  github: 'https://github.com/Humphrey-Steinbeck/TrustKey',
  discord: 'https://discord.gg/trustkey',
  twitter: 'https://twitter.com/trustkey',
} as const;

export const NETWORK_CONFIG = {
  localhost: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    blockExplorer: '',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
  },
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  identity: {
    get: '/api/identity',
    register: '/api/identity/register',
    update: '/api/identity/update',
    deactivate: '/api/identity/deactivate',
    status: '/api/identity/status',
  },
  credential: {
    generate: '/api/credential/generate',
    verify: '/api/credential/verify',
    validate: '/api/credential/validate',
    revoke: '/api/credential/revoke',
    status: '/api/credential/status',
  },
  reputation: {
    get: '/api/reputation',
    issueEvent: '/api/reputation/issue-event',
    events: '/api/reputation/events',
    leaderboard: '/api/reputation/stats/leaderboard',
  },
  verification: {
    request: '/api/verification/request',
    generateProof: '/api/verification/generate-proof',
    verifyProof: '/api/verification/verify-proof',
    circuits: '/api/verification/circuits',
  },
} as const;

export const CREDENTIAL_TYPES = {
  IDENTITY: 'IdentityCredential',
  EDUCATION: 'EducationCredential',
  PROFESSIONAL: 'ProfessionalCredential',
  MEMBERSHIP: 'MembershipCredential',
  CERTIFICATION: 'CertificationCredential',
} as const;

export const VERIFICATION_TYPES = {
  IDENTITY: 'identity_verification',
  AGE: 'age_verification',
  KYC: 'kyc_verification',
  REPUTATION: 'reputation_verification',
  MEMBERSHIP: 'membership_verification',
} as const;

export const TRUST_LEVELS = {
  1: { label: 'Newcomer', color: 'gray', threshold: 0 },
  2: { label: 'Established', color: 'blue', threshold: 100 },
  3: { label: 'Trusted', color: 'green', threshold: 300 },
  4: { label: 'Highly Trusted', color: 'purple', threshold: 600 },
  5: { label: 'Expert', color: 'yellow', threshold: 1000 },
} as const;

export const REPUTATION_EVENTS = {
  VERIFICATION_COMPLETED: 'verification_completed',
  TRANSACTION_COMPLETED: 'transaction_completed',
  REVIEW_POSITIVE: 'review_positive',
  REVIEW_NEGATIVE: 'review_negative',
  VERIFICATION_FAILED: 'verification_failed',
  MEMBERSHIP_GRANTED: 'membership_granted',
  CERTIFICATION_EARNED: 'certification_earned',
} as const;

export const CIRCUIT_TYPES = {
  CREDENTIAL_VERIFICATION: 'credential_verification',
  AGE_VERIFICATION: 'age_verification',
  KYC_VERIFICATION: 'kyc_verification',
  REPUTATION_VERIFICATION: 'reputation_verification',
  MEMBERSHIP_VERIFICATION: 'membership_verification',
} as const;

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  AUTHENTICATION_REQUIRED: 'Please authenticate to access this feature',
  INVALID_CREDENTIAL: 'Invalid credential data provided',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  CREDENTIAL_EXPIRED: 'This credential has expired',
  CREDENTIAL_REVOKED: 'This credential has been revoked',
  VERIFICATION_FAILED: 'Credential verification failed',
  REPUTATION_INSUFFICIENT: 'Insufficient reputation for this action',
} as const;

export const SUCCESS_MESSAGES = {
  IDENTITY_REGISTERED: 'Identity registered successfully',
  IDENTITY_UPDATED: 'Identity updated successfully',
  CREDENTIAL_GENERATED: 'Credential generated successfully',
  CREDENTIAL_VERIFIED: 'Credential verified successfully',
  REPUTATION_UPDATED: 'Reputation updated successfully',
  VERIFICATION_COMPLETED: 'Verification completed successfully',
  PROOF_GENERATED: 'Zero-knowledge proof generated successfully',
} as const;

export const VALIDATION_RULES = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
  IPFS_HASH: /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/,
  CREDENTIAL_HASH: /^0x[a-fA-F0-9]{64}$/,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'trustkey_access_token',
  REFRESH_TOKEN: 'trustkey_refresh_token',
  USER_PREFERENCES: 'trustkey_user_preferences',
  WALLET_CONNECTION: 'trustkey_wallet_connection',
  THEME: 'trustkey_theme',
  LANGUAGE: 'trustkey_language',
} as const;

export const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
  IDENTITY: { windowMs: 5 * 60 * 1000, max: 20 },
  READ: { windowMs: 1 * 60 * 1000, max: 100 },
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 500,
  PAGINATION_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;
