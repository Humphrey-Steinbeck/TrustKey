// TrustKey Web3 Context

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../hooks/useAuth';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  getBalance: () => Promise<string>;
  sendTransaction: (to: string, value: string) => Promise<ethers.providers.TransactionResponse>;
  signMessage: (message: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // Initialize Web3 connection
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const initWeb3 = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0]);
            setChainId(network.chainId);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error initializing Web3:', error);
        }
      };

      initWeb3();
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        // Reload the page to ensure proper network handling
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect to MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(network.chainId);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from MetaMask
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        const networkConfig = getNetworkConfig(targetChainId);
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        }
      } else {
        throw error;
      }
    }
  };

  // Get network configuration
  const getNetworkConfig = (chainId: number) => {
    const networks = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io'],
      },
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      1337: {
        chainId: '0x539',
        chainName: 'Localhost',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['http://localhost:8545'],
        blockExplorerUrls: [],
      },
    };

    return networks[chainId as keyof typeof networks];
  };

  // Get account balance
  const getBalance = async (): Promise<string> => {
    if (!provider || !account) {
      throw new Error('Provider or account not available');
    }

    const balance = await provider.getBalance(account);
    return ethers.utils.formatEther(balance);
  };

  // Send transaction
  const sendTransaction = async (to: string, value: string): Promise<ethers.providers.TransactionResponse> => {
    if (!signer) {
      throw new Error('Signer not available');
    }

    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(value),
    });

    return tx;
  };

  // Sign message
  const signMessage = async (message: string): Promise<string> => {
    if (!signer) {
      throw new Error('Signer not available');
    }

    return await signer.signMessage(message);
  };

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    getBalance,
    sendTransaction,
    signMessage,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use Web3 context
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
