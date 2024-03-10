# TrustKey Deployment Guide

## Overview

This guide covers deploying TrustKey to various environments, from local development to production. TrustKey consists of three main components:

1. **Smart Contracts** - Deployed on Ethereum-compatible networks
2. **Backend API** - Node.js server with IPFS integration
3. **Frontend Dashboard** - React application

## Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible wallet
- IPFS node (local or remote)
- Ethereum RPC endpoint

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Humphrey-Steinbeck/TrustKey.git
cd TrustKey
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts && npm install

# Install backend dependencies
cd ../backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Variables

Create environment files for each component:

#### Backend (.env)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Blockchain Configuration
NETWORK=localhost
ETHEREUM_RPC_URL=http://localhost:8545
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your-private-key-for-contract-interactions

# Contract Addresses (set after deployment)
IDENTITY_REGISTRY_ADDRESS=
REPUTATION_SCORE_ADDRESS=
VC_VERIFIER_ADDRESS=

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Rate Limiting
REPORT_GAS=true
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_NETWORK=localhost
REACT_APP_CHAIN_ID=1337
```

#### Contracts (.env)
```bash
# Network Configuration
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Private Key for Deployment
PRIVATE_KEY=your-deployment-private-key

# Etherscan API Key (for verification)
ETHERSCAN_API_KEY=your-etherscan-api-key

# Gas Configuration
REPORT_GAS=true
```

## Local Development

### 1. Start IPFS Node

```bash
# Install IPFS
npm install -g ipfs

# Initialize and start IPFS
ipfs init
ipfs daemon
```

### 2. Start Local Blockchain

```bash
# Using Hardhat
cd contracts
npx hardhat node
```

### 3. Deploy Smart Contracts

```bash
# In contracts directory
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses to your backend .env file.

### 4. Start Backend API

```bash
# In backend directory
npm run dev
```

### 5. Start Frontend

```bash
# In frontend directory
npm start
```

## Production Deployment

### Smart Contracts

#### 1. Deploy to Sepolia Testnet

```bash
cd contracts

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

#### 2. Deploy to Mainnet

```bash
# Deploy to Mainnet (be careful!)
npx hardhat run scripts/deploy.js --network mainnet

# Verify contracts
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```

### Backend API

#### Option 1: Docker Deployment

```bash
# Create Dockerfile in backend directory
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t trustkey-backend .
docker run -p 3000:3000 --env-file .env trustkey-backend
```

#### Option 2: Cloud Deployment

**Heroku:**
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create trustkey-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set ETHEREUM_RPC_URL=your-rpc-url
# ... set other variables

# Deploy
git push heroku main
```

**AWS EC2:**
```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start src/app.js --name trustkey-api

# Save PM2 configuration
pm2 save
pm2 startup
```

**DigitalOcean App Platform:**
```yaml
# .do/app.yaml
name: trustkey-api
services:
- name: api
  source_dir: backend
  github:
    repo: Humphrey-Steinbeck/TrustKey
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-production-secret
```

### Frontend Dashboard

#### Option 1: Netlify

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

#### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Option 3: AWS S3 + CloudFront

```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## IPFS Configuration

### Option 1: Pinata (Recommended for Production)

```bash
# Install Pinata SDK
npm install @pinata/sdk

# Configure in backend
const pinata = new PinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY
});
```

### Option 2: Infura IPFS

```bash
# Configure in backend
const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`
    ).toString('base64')}`
  }
});
```

### Option 3: Self-hosted IPFS

```bash
# Install IPFS
npm install -g ipfs

# Configure IPFS
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Start IPFS
ipfs daemon
```

## Database Setup

TrustKey uses IPFS for metadata storage and blockchain for core data. For production, consider adding:

### PostgreSQL (Optional)

```bash
# Install PostgreSQL
npm install pg

# Create database
createdb trustkey

# Run migrations
npm run migrate
```

### Redis (Optional, for caching)

```bash
# Install Redis
npm install redis

# Configure in backend
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
```

## Monitoring and Logging

### Application Monitoring

```bash
# Install monitoring tools
npm install --save @sentry/node
npm install --save express-rate-limit
npm install --save helmet
```

### Logging

```bash
# Install logging
npm install --save winston
npm install --save morgan
```

### Health Checks

```bash
# Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## Security Considerations

### 1. Environment Variables

- Never commit .env files
- Use strong, unique secrets
- Rotate secrets regularly
- Use environment-specific configurations

### 2. API Security

```bash
# Install security middleware
npm install --save helmet
npm install --save cors
npm install --save express-rate-limit
```

### 3. Smart Contract Security

- Use OpenZeppelin contracts
- Implement proper access controls
- Test thoroughly before deployment
- Consider formal verification

### 4. Frontend Security

- Use HTTPS in production
- Implement CSP headers
- Validate all inputs
- Use secure authentication

## Performance Optimization

### 1. Backend Optimization

```bash
# Install performance tools
npm install --save compression
npm install --save express-cache-controller
```

### 2. Frontend Optimization

```bash
# Build optimization
npm run build

# Enable gzip compression
npm install --save compression-webpack-plugin
```

### 3. IPFS Optimization

- Pin important content
- Use IPFS clusters for redundancy
- Implement caching strategies

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check RPC URL and private key
   - Ensure sufficient gas
   - Verify network configuration

2. **IPFS connection issues**
   - Check IPFS node status
   - Verify network connectivity
   - Check firewall settings

3. **Authentication errors**
   - Verify JWT secret
   - Check token expiration
   - Validate signature format

4. **Frontend build errors**
   - Check Node.js version
   - Clear npm cache
   - Verify environment variables

### Debug Mode

```bash
# Enable debug logging
DEBUG=trustkey:* npm start

# Enable verbose logging
NODE_ENV=development npm start
```

## Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Monitor contract events**
   ```bash
   npx hardhat console --network mainnet
   ```

3. **Backup IPFS data**
   ```bash
   ipfs pin ls --type recursive
   ```

4. **Monitor API performance**
   - Check response times
   - Monitor error rates
   - Review usage metrics

### Scaling Considerations

1. **Horizontal scaling**
   - Use load balancers
   - Implement session management
   - Consider microservices

2. **Database scaling**
   - Implement read replicas
   - Use connection pooling
   - Consider sharding

3. **IPFS scaling**
   - Use IPFS clusters
   - Implement CDN integration
   - Consider pinning services

## Support

For deployment support:
- Documentation: https://docs.trustkey.io
- GitHub Issues: https://github.com/Humphrey-Steinbeck/TrustKey/issues
- Community Discord: https://discord.gg/trustkey
