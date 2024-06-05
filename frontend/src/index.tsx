// TrustKey Frontend Application Entry Point

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './styles/globals.css';

// Create root element
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render application
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Web3Provider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
