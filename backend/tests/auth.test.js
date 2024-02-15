const request = require('supertest');
const app = require('../src/app');
const { ethers } = require('ethers');

describe('Authentication API', () => {
  let testWallet;
  let testMessage;
  let testSignature;

  beforeAll(() => {
    // Create a test wallet
    testWallet = ethers.Wallet.createRandom();
    testMessage = 'TrustKey Authentication\nAddress: ' + testWallet.address + '\nTimestamp: ' + new Date().toISOString();
    testSignature = testWallet.signMessage(testMessage);
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid signature', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          address: testWallet.address,
          signature: testSignature,
          message: testMessage
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.address).toBe(testWallet.address);
    });

    it('should reject invalid signature', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          address: testWallet.address,
          signature: '0xinvalid',
          message: testMessage
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid signature');
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          address: testWallet.address
          // Missing signature and message
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid address format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          address: 'invalid-address',
          signature: testSignature,
          message: testMessage
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid signature', async () => {
      const newWallet = ethers.Wallet.createRandom();
      const message = 'TrustKey Authentication\nAddress: ' + newWallet.address + '\nTimestamp: ' + new Date().toISOString();
      const signature = newWallet.signMessage(message);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          address: newWallet.address,
          signature: signature,
          message: message
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.address).toBe(newWallet.address);
    });

    it('should reject registration with invalid signature', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          address: testWallet.address,
          signature: '0xinvalid',
          message: testMessage
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify-signature', () => {
    it('should verify valid signature', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .send({
          address: testWallet.address,
          signature: testSignature,
          message: testMessage
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .send({
          address: testWallet.address,
          signature: '0xinvalid',
          message: testMessage
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          address: testWallet.address,
          signature: testSignature,
          message: testMessage
        });
      
      authToken = loginResponse.body.data.accessToken;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.address).toBe(testWallet.address);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeAll(async () => {
      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          address: testWallet.address,
          signature: testSignature,
          message: testMessage
        });
      
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
