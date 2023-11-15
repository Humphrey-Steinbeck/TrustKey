import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Shield, 
  Award, 
  CheckCircle, 
  FileText, 
  Code,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Identity', href: '/identity', icon: User },
  { name: 'Credentials', href: '/credentials', icon: Shield },
  { name: 'Reputation', href: '/reputation', icon: Award },
  { name: 'Verification', href: '/verification', icon: CheckCircle },
  { name: 'Issuer', href: '/issuer', icon: FileText },
  { name: 'API', href: '/api', icon: Code },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { account, isConnected, connect, disconnect } = useWeb3();
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleWalletConnect = async () => {
    try {
      if (!isConnected) {
        await connect();
      } else {
        await login();
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TrustKey</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">TrustKey</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-600 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Wallet connection status */}
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Wallet className="h-4 w-4" />
                    <span className="font-mono">
                      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
                    </span>
                  </div>
                  
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Authenticated</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="btn btn-sm btn-secondary"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleWalletConnect}
                      className="btn btn-sm btn-primary"
                    >
                      Login
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleWalletConnect}
                  className="btn btn-primary"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
