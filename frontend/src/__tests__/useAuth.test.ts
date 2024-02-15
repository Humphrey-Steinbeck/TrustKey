import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../hooks/useAuth';
import { authService } from '../services/authService';

// Mock authService
jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock useWeb3
jest.mock('./useWeb3', () => ({
  useWeb3: () => ({
    isConnected: true,
    account: '0x1234567890123456789012345678901234567890',
    signer: {
      signMessage: jest.fn().mockResolvedValue('0xsignedmessage')
    }
  })
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should initialize with default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('should login successfully', async () => {
    const mockLoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        address: '0x1234567890123456789012345678901234567890',
        hasIdentity: false,
        role: 'user'
      }
    };

    (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.login();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockLoginResponse.user);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trustkey_access_token', 'mock-access-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trustkey_refresh_token', 'mock-refresh-token');
  });

  it('should handle login error', async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      try {
        await result.current.login();
      } catch (error) {
        expect(error.message).toBe('Login failed');
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should logout successfully', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('trustkey_access_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('trustkey_refresh_token');
  });

  it('should refresh user data', async () => {
    const mockUserData = {
      user: {
        address: '0x1234567890123456789012345678901234567890',
        role: 'user'
      },
      identity: {
        identityId: 'test-id',
        isActive: true
      },
      reputation: {
        totalScore: 100,
        trustLevel: 2
      }
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUserData);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set authenticated state first
    act(() => {
      result.current.user = { address: '0x1234567890123456789012345678901234567890', role: 'user' };
      result.current.isAuthenticated = true;
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle refresh user error', async () => {
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Failed to refresh'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set authenticated state first
    act(() => {
      result.current.user = { address: '0x1234567890123456789012345678901234567890', role: 'user' };
      result.current.isAuthenticated = true;
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    // Should logout on error
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should check for existing token on mount', async () => {
    localStorageMock.getItem.mockReturnValue('existing-token');
    
    const mockUserData = {
      user: {
        address: '0x1234567890123456789012345678901234567890',
        role: 'user'
      }
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUserData);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUserData.user);
  });

  it('should handle invalid token on mount', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token');
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('trustkey_access_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('trustkey_refresh_token');
  });
});
