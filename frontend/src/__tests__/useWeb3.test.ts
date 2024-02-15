import { renderHook, act } from '@testing-library/react';
import { useWeb3 } from '../hooks/useWeb3';
import { Web3Provider } from '../hooks/useWeb3';

// Mock ethers
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
    JsonRpcProvider: jest.fn()
  },
  Wallet: jest.fn(),
  utils: {
    isAddress: jest.fn(),
    verifyMessage: jest.fn()
  }
}));

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn()
};

Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true
});

describe('useWeb3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when used outside Web3Provider', () => {
    expect(() => {
      renderHook(() => useWeb3());
    }).toThrow('useWeb3 must be used within a Web3Provider');
  });

  it('should initialize with default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    expect(result.current.provider).toBeNull();
    expect(result.current.signer).toBeNull();
    expect(result.current.account).toBeNull();
    expect(result.current.chainId).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
  });

  it('should connect wallet successfully', async () => {
    const mockAccounts = ['0x1234567890123456789012345678901234567890'];
    const mockNetwork = { chainId: 1, name: 'homestead' };

    mockEthereum.request.mockResolvedValue(mockAccounts);

    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue(mockNetwork),
      getSigner: jest.fn().mockReturnValue({
        signMessage: jest.fn()
      })
    };

    const { providers } = require('ethers');
    providers.Web3Provider.mockImplementation(() => mockProvider);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.account).toBe(mockAccounts[0]);
    expect(result.current.chainId).toBe(1);
  });

  it('should handle connection error', async () => {
    mockEthereum.request.mockRejectedValue(new Error('User rejected'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        expect(error.message).toBe('User rejected the connection request.');
      }
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should disconnect wallet', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    // First connect
    const mockAccounts = ['0x1234567890123456789012345678901234567890'];
    mockEthereum.request.mockResolvedValue(mockAccounts);

    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'homestead' }),
      getSigner: jest.fn().mockReturnValue({})
    };

    const { providers } = require('ethers');
    providers.Web3Provider.mockImplementation(() => mockProvider);

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);

    // Then disconnect
    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBeNull();
    expect(result.current.chainId).toBeNull();
  });

  it('should switch network', async () => {
    const targetChainId = 137; // Polygon
    mockEthereum.request.mockResolvedValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    await act(async () => {
      await result.current.switchNetwork(targetChainId);
    });

    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }] // 137 in hex
    });
  });

  it('should handle network switch error', async () => {
    const targetChainId = 999; // Non-existent network
    mockEthereum.request.mockRejectedValue({ code: 4902 });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    await act(async () => {
      try {
        await result.current.switchNetwork(targetChainId);
      } catch (error) {
        expect(error.message).toBe('Network with chain ID 999 is not added to MetaMask.');
      }
    });
  });

  it('should get balance', async () => {
    const mockBalance = '1.5';
    const mockProvider = {
      getBalance: jest.fn().mockResolvedValue(mockBalance)
    };

    const { providers, utils } = require('ethers');
    providers.Web3Provider.mockImplementation(() => mockProvider);
    utils.formatEther = jest.fn().mockReturnValue(mockBalance);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    // Set up connected state
    act(() => {
      result.current.account = '0x1234567890123456789012345678901234567890';
      result.current.provider = mockProvider;
    });

    let balance: string;
    await act(async () => {
      balance = await result.current.getBalance();
    });

    expect(balance).toBe(mockBalance);
    expect(mockProvider.getBalance).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890');
  });

  it('should handle balance error when not connected', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Web3Provider>{children}</Web3Provider>
    );

    const { result } = renderHook(() => useWeb3(), { wrapper });

    await act(async () => {
      try {
        await result.current.getBalance();
      } catch (error) {
        expect(error.message).toBe('Not connected to wallet');
      }
    });
  });
});
