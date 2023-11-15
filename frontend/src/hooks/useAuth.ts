import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWeb3 } from './useWeb3';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  address: string;
  role: string;
  hasIdentity: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { account, isConnected, signer } = useWeb3();

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('trustkey_access_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('trustkey_access_token');
          localStorage.removeItem('trustkey_refresh_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Auto-login when wallet connects
  useEffect(() => {
    if (isConnected && account && !isAuthenticated) {
      const token = localStorage.getItem('trustkey_access_token');
      if (token) {
        // Try to refresh user data
        refreshUser();
      }
    }
  }, [isConnected, account, isAuthenticated]);

  const login = async () => {
    if (!isConnected || !account || !signer) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setIsLoading(true);
      
      // Generate authentication message
      const message = `TrustKey Authentication\nAddress: ${account}\nTimestamp: ${new Date().toISOString()}\nNonce: ${Math.random().toString(36).substring(2, 15)}`;
      
      // Sign the message
      const signature = await signer.signMessage(message);
      
      // Authenticate with backend
      const response = await authService.login({
        address: account,
        signature,
        message,
      });

      // Store tokens
      localStorage.setItem('trustkey_access_token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('trustkey_refresh_token', response.refreshToken);
      }

      // Set user data
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('trustkey_access_token');
    localStorage.removeItem('trustkey_refresh_token');
    
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, logout user
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
