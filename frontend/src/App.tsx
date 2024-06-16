// TrustKey Main Application Component

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useWeb3 } from './contexts/Web3Context';
import { useTheme } from './contexts/ThemeContext';
import { useToast } from './contexts/ToastContext';
import Layout from './components/Layout';
import Loading from './components/Loading';
import Dashboard from './pages/Dashboard';
import Identity from './pages/Identity';
import Credentials from './pages/Credentials';
import Reputation from './pages/Reputation';
import Verification from './pages/Verification';
import Issuer from './pages/Issuer';
import API from './pages/API';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected } = useWeb3();

  if (isLoading) {
    return <Loading fullScreen text="Loading application..." />;
  }

  if (!isAuthenticated || !isConnected) {
    return <Navigate to="/identity" replace />;
  }

  return <>{children}</>;
};

// Main App component
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected, isConnecting } = useWeb3();
  const { theme, isDark } = useTheme();
  const { showError } = useToast();

  // Handle Web3 connection errors
  React.useEffect(() => {
    if (!isConnecting && !isConnected && isAuthenticated) {
      showError('Wallet Connection Required', 'Please connect your wallet to continue using the application.');
    }
  }, [isConnected, isConnecting, isAuthenticated, showError]);

  // Show loading screen while initializing
  if (isLoading) {
    return <Loading fullScreen text="Initializing TrustKey..." />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Routes>
          {/* Public routes */}
          <Route path="/identity" element={<Identity />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/credentials"
            element={
              <ProtectedRoute>
                <Layout>
                  <Credentials />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reputation"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reputation />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/verification"
            element={
              <ProtectedRoute>
                <Layout>
                  <Verification />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/issuer"
            element={
              <ProtectedRoute>
                <Layout>
                  <Issuer />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/api"
            element={
              <ProtectedRoute>
                <Layout>
                  <API />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated && isConnected ? "/dashboard" : "/identity"}
                replace
              />
            }
          />
          
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    404
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Page not found
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;