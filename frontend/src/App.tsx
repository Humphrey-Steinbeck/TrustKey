import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './hooks/useWeb3';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Identity from './pages/Identity';
import Credentials from './pages/Credentials';
import Reputation from './pages/Reputation';
import Verification from './pages/Verification';
import Issuer from './pages/Issuer';
import API from './pages/API';
import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/identity" element={<Identity />} />
                  <Route path="/credentials" element={<Credentials />} />
                  <Route path="/reputation" element={<Reputation />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/issuer" element={<Issuer />} />
                  <Route path="/api" element={<API />} />
                </Routes>
              </Layout>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
