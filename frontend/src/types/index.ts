// TrustKey Type Definitions

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  did: string;
  publicKey: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Credential Types
export interface Credential {
  id: string;
  type: string;
  issuer: string;
  subject: string;
  claims: Record<string, any>;
  proof: CredentialProof;
  issuanceDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'revoked';
  metadata?: Record<string, any>;
}

export interface CredentialProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws?: string;
  proofValue?: string;
}

export interface CredentialRequest {
  type: string;
  issuer: string;
  subject: string;
  claims: Record<string, any>;
  expirationDate?: string;
  metadata?: Record<string, any>;
}

// Identity Types
export interface Identity {
  did: string;
  publicKey: string;
  attributes: Record<string, any>;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface IdentityRequest {
  publicKey: string;
  attributes: Record<string, any>;
}

// Reputation Types
export interface ReputationScore {
  userId: string;
  score: number;
  level: number;
  events: ReputationEvent[];
  lastUpdated: string;
}

export interface ReputationEvent {
  id: string;
  type: string;
  value: number;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  issuer: string;
}

export interface ReputationRequest {
  type: string;
  value: number;
  description: string;
  metadata?: Record<string, any>;
}

// Verification Types
export interface VerificationRequest {
  credentialId: string;
  circuitType: string;
  publicInputs: Record<string, any>;
  privateInputs: Record<string, any>;
}

export interface VerificationProof {
  id: string;
  credentialId: string;
  circuitType: string;
  proof: string;
  publicInputs: Record<string, any>;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
  verifiedAt?: string;
}

export interface CircuitConfig {
  type: string;
  name: string;
  description: string;
  publicInputs: string[];
  privateInputs: string[];
  constraints: string[];
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Web3 Types
export interface Web3State {
  provider: any;
  signer: any;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  data?: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeState {
  theme: Theme;
  isDark: boolean;
}

// Storage Types
export interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
}

// Event Types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: string;
  source: string;
}

// Configuration Types
export interface AppConfig {
  apiUrl: string;
  chainId: number;
  contractAddresses: Record<string, string>;
  ipfsGateway: string;
  features: Record<string, boolean>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormComponentProps extends BaseComponentProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface ButtonComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

export interface InputComponentProps extends FormComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Hook Types
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UseApiReturn<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

// Export all types
export * from './index';
