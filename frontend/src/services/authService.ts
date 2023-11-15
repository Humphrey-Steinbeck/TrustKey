import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustkey_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('trustkey_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('trustkey_access_token', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('trustkey_access_token');
        localStorage.removeItem('trustkey_refresh_token');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

interface LoginRequest {
  address: string;
  signature: string;
  message: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    address: string;
    hasIdentity: boolean;
    role: string;
  };
}

interface UserResponse {
  user: {
    address: string;
    role: string;
  };
  identity?: any;
  reputation?: any;
}

export const authService = {
  /**
   * Login with wallet signature
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  /**
   * Register new user
   */
  async register(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  /**
   * Verify wallet signature
   */
  async verifySignature(data: LoginRequest): Promise<{ isValid: boolean }> {
    const response = await api.post('/auth/verify-signature', data);
    return response.data.data;
  },
};

export default authService;
