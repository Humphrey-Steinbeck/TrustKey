// TrustKey API Client

import { API_CONFIG, SECURITY_CONFIG } from '../config';
import { tokenManager } from '../utils/storage';
import { parseErrorMessage, retry } from '../utils/helpers';

// API Response types
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

// Request options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  requireAuth?: boolean;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Get default headers
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = tokenManager.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Make HTTP request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      retries = this.retryAttempts,
      retryDelay = this.retryDelay,
      requireAuth = true,
    } = options;

    // Check authentication requirement
    if (requireAuth && !tokenManager.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = {
      ...this.getDefaultHeaders(),
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await retry(
        () => fetch(url, requestOptions),
        retries,
        retryDelay
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'POST', body });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PUT', body });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {
      ...this.getDefaultHeaders(),
      ...options?.headers,
    };

    // Remove Content-Type header to let browser set it with boundary
    delete headers['Content-Type'];

    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // Download file
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const response = await this.makeRequest<Blob>(endpoint, {
      method: 'GET',
      headers: {
        ...this.getDefaultHeaders(),
        Accept: 'application/octet-stream',
      },
    });

    if (response.data) {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await this.makeRequest<{ accessToken: string; refreshToken: string }>(
        API_CONFIG.ENDPOINTS.auth.refresh,
        {
          method: 'POST',
          body: { refreshToken },
          requireAuth: false,
        }
      );

      if (response.success && response.data) {
        tokenManager.setAccessToken(response.data.accessToken);
        tokenManager.setRefreshToken(response.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Handle token expiration
  private async handleTokenExpiration(): Promise<boolean> {
    const refreshed = await this.refreshToken();
    if (!refreshed) {
      tokenManager.clearTokens();
      // Redirect to login or emit auth event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return false;
    }
    return true;
  }

  // Set base URL
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Set timeout
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  // Set retry configuration
  setRetryConfig(attempts: number, delay: number): void {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient.post<T>(endpoint, body, options),
  put: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient.put<T>(endpoint, body, options),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient.delete<T>(endpoint, options),
  patch: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient.patch<T>(endpoint, body, options),
  uploadFile: <T>(endpoint: string, file: File, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient.uploadFile<T>(endpoint, file, options),
  downloadFile: (endpoint: string, filename?: string) =>
    apiClient.downloadFile(endpoint, filename),
  refreshToken: () => apiClient.refreshToken(),
  setBaseURL: (url: string) => apiClient.setBaseURL(url),
  setTimeout: (timeout: number) => apiClient.setTimeout(timeout),
  setRetryConfig: (attempts: number, delay: number) => apiClient.setRetryConfig(attempts, delay),
};

export default apiClient;
