const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const identityRoutes = require('./routes/identity');
const credentialRoutes = require('./routes/credential');
const reputationRoutes = require('./routes/reputation');
const verificationRoutes = require('./routes/verification');
const authRoutes = require('./routes/auth');

const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/credential', credentialRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/verification', verificationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'TrustKey API',
    version: '1.0.0',
    description: 'Decentralized Identity and Reputation System API',
    endpoints: {
      auth: '/api/auth',
      identity: '/api/identity',
      credential: '/api/credential',
      reputation: '/api/reputation',
      verification: '/api/verification'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/identity/:address',
      'POST /api/credential/generate',
      'POST /api/credential/verify',
      'GET /api/reputation/:address',
      'POST /api/verification/request'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TrustKey API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
