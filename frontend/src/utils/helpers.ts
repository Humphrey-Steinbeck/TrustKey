// TrustKey Utility Helper Functions

import { ethers } from 'ethers';
import { VALIDATION_RULES, TRUST_LEVELS, CREDENTIAL_TYPES } from './constants';

/**
 * Format Ethereum address for display
 */
export const formatAddress = (address: string, length: number = 6): string => {
  if (!address || !VALIDATION_RULES.ETHEREUM_ADDRESS.test(address)) {
    return 'Invalid Address';
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
};

/**
 * Format large numbers with appropriate suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format reputation score with appropriate trust level
 */
export const formatReputation = (score: number): { score: string; level: string; color: string } => {
  const level = Object.entries(TRUST_LEVELS)
    .reverse()
    .find(([_, config]) => score >= config.threshold);
  
  const trustLevel = level ? TRUST_LEVELS[level[0] as keyof typeof TRUST_LEVELS] : TRUST_LEVELS[1];
  
  return {
    score: formatNumber(score),
    level: trustLevel.label,
    color: trustLevel.color,
  };
};

/**
 * Format date to relative time
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const targetDate = new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return targetDate.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.test(phone);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  return VALIDATION_RULES.URL.test(url);
};

/**
 * Validate IPFS hash
 */
export const isValidIPFSHash = (hash: string): boolean => {
  return VALIDATION_RULES.IPFS_HASH.test(hash);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate credential ID
 */
export const generateCredentialId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = generateRandomString(8);
  return `cred_${timestamp}_${random}`;
};

/**
 * Generate verification ID
 */
export const generateVerificationId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = generateRandomString(8);
  return `ver_${timestamp}_${random}`;
};

/**
 * Hash string using SHA-256
 */
export const hashString = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Convert bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get credential type display name
 */
export const getCredentialTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    [CREDENTIAL_TYPES.IDENTITY]: 'Identity Credential',
    [CREDENTIAL_TYPES.EDUCATION]: 'Education Credential',
    [CREDENTIAL_TYPES.PROFESSIONAL]: 'Professional Credential',
    [CREDENTIAL_TYPES.MEMBERSHIP]: 'Membership Credential',
    [CREDENTIAL_TYPES.CERTIFICATION]: 'Certification Credential',
  };
  
  return typeMap[type] || type;
};

/**
 * Calculate trust score from reputation events
 */
export const calculateTrustScore = (events: Array<{ type: string; value: number }>): number => {
  return events.reduce((total, event) => {
    const multiplier = event.type.includes('positive') ? 1 : -1;
    return total + (event.value * multiplier);
  }, 0);
};

/**
 * Get color for trust level
 */
export const getTrustLevelColor = (score: number): string => {
  const { color } = formatReputation(score);
  return color;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Download data as file
 */
export const downloadFile = (data: string, filename: string, type: string = 'text/plain'): void => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parse error message from API response
 */
export const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return 'An unexpected error occurred';
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
