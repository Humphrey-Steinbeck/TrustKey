// TrustKey Application Configuration

import { NETWORK_CONFIG, API_ENDPOINTS, APP_CONFIG } from '../utils/constants';

// Environment configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  CHAIN_ID: parseInt(process.env.REACT_APP_CHAIN_ID || '1337'),
  IPFS_GATEWAY: process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID || '',
  ALCHEMY_API_KEY: process.env.REACT_APP_ALCHEMY_API_KEY || '',
  WALLET_CONNECT_PROJECT_ID: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '',
} as const;

// Smart contract addresses
export const CONTRACT_ADDRESSES = {
  IDENTITY_REGISTRY: process.env.REACT_APP_IDENTITY_REGISTRY_ADDRESS || '',
  REPUTATION_SCORE: process.env.REACT_APP_REPUTATION_SCORE_ADDRESS || '',
  VC_VERIFIER: process.env.REACT_APP_VC_VERIFIER_ADDRESS || '',
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: API_ENDPOINTS,
} as const;

// Web3 configuration
export const WEB3_CONFIG = {
  CHAIN_ID: ENV.CHAIN_ID,
  NETWORK: NETWORK_CONFIG[ENV.CHAIN_ID as keyof typeof NETWORK_CONFIG] || NETWORK_CONFIG.localhost,
  CONTRACT_ADDRESSES,
  RPC_URL: process.env.REACT_APP_RPC_URL || 'http://localhost:8545',
  BLOCK_EXPLORER: process.env.REACT_APP_BLOCK_EXPLORER || '',
} as const;

// IPFS configuration
export const IPFS_CONFIG = {
  GATEWAY: ENV.IPFS_GATEWAY,
  PINATA_API_KEY: process.env.REACT_APP_PINATA_API_KEY || '',
  PINATA_SECRET_KEY: process.env.REACT_APP_PINATA_SECRET_KEY || '',
  PINATA_GATEWAY: process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_ZKP: process.env.REACT_APP_ENABLE_ZKP === 'true',
  ENABLE_REPUTATION: process.env.REACT_APP_ENABLE_REPUTATION === 'true',
  ENABLE_CREDENTIALS: process.env.REACT_APP_ENABLE_CREDENTIALS === 'true',
  ENABLE_VERIFICATION: process.env.REACT_APP_ENABLE_VERIFICATION === 'true',
  ENABLE_ISSUER_PANEL: process.env.REACT_APP_ENABLE_ISSUER_PANEL === 'true',
  ENABLE_DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
} as const;

// UI configuration
export const UI_CONFIG = {
  THEME: {
    DEFAULT: 'auto' as const,
    STORAGE_KEY: 'trustkey_theme',
  },
  LANGUAGE: {
    DEFAULT: 'en' as const,
    STORAGE_KEY: 'trustkey_language',
    SUPPORTED: ['en', 'zh', 'es', 'fr', 'de'] as const,
  },
  TOAST: {
    DEFAULT_DURATION: 4000,
    MAX_TOASTS: 5,
    POSITION: 'top-right' as const,
  },
  MODAL: {
    DEFAULT_SIZE: 'md' as const,
    CLOSE_ON_OVERLAY: true,
    CLOSE_ON_ESCAPE: true,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  },
} as const;

// Security configuration
export const SECURITY_CONFIG = {
  JWT: {
    STORAGE_KEY: 'trustkey_access_token',
    REFRESH_KEY: 'trustkey_refresh_token',
    EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
  },
  RATE_LIMITING: {
    ENABLED: true,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  CORS: {
    ALLOWED_ORIGINS: process.env.REACT_APP_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  ENABLED: FEATURES.ENABLE_ANALYTICS,
  GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GA_ID || '',
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN || '',
  HOTJAR_ID: process.env.REACT_APP_HOTJAR_ID || '',
} as const;

// Development configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: ENV.NODE_ENV === 'development',
  ENABLE_DEVTOOLS: ENV.NODE_ENV === 'development',
  MOCK_API: process.env.REACT_APP_MOCK_API === 'true',
  MOCK_WEB3: process.env.REACT_APP_MOCK_WEB3 === 'true',
} as const;

// Validation configuration
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/,
  },
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword'],
    ARCHIVES: ['application/zip', 'application/x-rar-compressed'],
  },
  IPFS: {
    ENABLED: true,
    GATEWAY: IPFS_CONFIG.GATEWAY,
  },
} as const;

// Export all configuration
export const CONFIG = {
  ENV,
  APP: APP_CONFIG,
  API: API_CONFIG,
  WEB3: WEB3_CONFIG,
  IPFS: IPFS_CONFIG,
  FEATURES,
  UI: UI_CONFIG,
  SECURITY: SECURITY_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  DEV: DEV_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
} as const;

export default CONFIG;
