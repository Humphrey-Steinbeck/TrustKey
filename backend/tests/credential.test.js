const request = require('supertest');
const app = require('../src/app');
const { ethers } = require('ethers');

describe('Credential API', () => {
  let testWallet;
  let authToken;
  let testCredential;

  beforeAll(async () => {
    // Create test wallet and get auth token
    testWallet = ethers.Wallet.createRandom();
    const message = 'TrustKey Authentication\nAddress: ' + testWallet.address + '\nTimestamp: ' + new Date().toISOString();
    const signature = testWallet.signMessage(message);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        address: testWallet.address,
        signature: signature,
        message: message
      });
    
    authToken = loginResponse.body.data.accessToken;

    // Create test credential
    testCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://trustkey.io/credentials/v1'
      ],
      id: 'urn:trustkey:credential:test123',
      type: ['VerifiableCredential', 'IdentityCredential'],
      issuer: {
        id: 'did:ethr:' + testWallet.address,
        name: 'TrustKey Test Issuer'
      },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: 'did:ethr:' + testWallet.address,
        type: 'Person',
        name: 'Test User',
        email: 'test@example.com'
      }
    };
  });

  describe('POST /api/credential/generate', () => {
    it('should generate credential with valid data', async () => {
      const response = await request(app)
        .post('/api/credential/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'IdentityCredential',
          subject: {
            id: 'did:ethr:' + testWallet.address,
            type: 'Person',
            properties: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+1234567890'
            }
          },
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('credential');
      expect(response.body.data).toHaveProperty('credentialHash');
      expect(response.body.data).toHaveProperty('metadataURI');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/credential/generate')
        .send({
          type: 'IdentityCredential',
          subject: {
            id: 'did:ethr:' + testWallet.address,
            type: 'Person',
            properties: {
              name: 'Test User'
            }
          }
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid credential data', async () => {
      const response = await request(app)
        .post('/api/credential/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          type: 'IdentityCredential'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/credential/verify', () => {
    it('should verify valid credential', async () => {
      const response = await request(app)
        .post('/api/credential/verify')
        .send({
          credential: testCredential
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isValid');
      expect(response.body.data).toHaveProperty('credentialHash');
      expect(response.body.data).toHaveProperty('validation');
    });

    it('should reject missing credential data', async () => {
      const response = await request(app)
        .post('/api/credential/verify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid credential structure', async () => {
      const invalidCredential = {
        // Missing required fields
        type: 'InvalidCredential'
      };

      const response = await request(app)
        .post('/api/credential/verify')
        .send({
          credential: invalidCredential
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
    });
  });

  describe('POST /api/credential/validate', () => {
    it('should validate valid credential structure', async () => {
      const response = await request(app)
        .post('/api/credential/validate')
        .send({
          credential: testCredential
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data).toHaveProperty('credentialId');
      expect(response.body.data).toHaveProperty('credentialType');
    });

    it('should reject invalid credential structure', async () => {
      const invalidCredential = {
        // Missing required fields
        type: 'InvalidCredential'
      };

      const response = await request(app)
        .post('/api/credential/validate')
        .send({
          credential: invalidCredential
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/credential/batch-verify', () => {
    it('should batch verify multiple credentials', async () => {
      const credentials = [testCredential, testCredential];

      const response = await request(app)
        .post('/api/credential/batch-verify')
        .send({
          credentials: credentials
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data.results.length).toBe(2);
      expect(response.body.data).toHaveProperty('validCount');
    });

    it('should reject empty credentials array', async () => {
      const response = await request(app)
        .post('/api/credential/batch-verify')
        .send({
          credentials: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject too many credentials', async () => {
      const credentials = new Array(25).fill(testCredential);

      const response = await request(app)
        .post('/api/credential/batch-verify')
        .send({
          credentials: credentials
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/credential/status/:hash', () => {
    it('should return credential status', async () => {
      const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('test-credential'));

      const response = await request(app)
        .get(`/api/credential/status/${credentialHash}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('credentialHash');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should reject invalid hash format', async () => {
      const response = await request(app)
        .get('/api/credential/status/invalid-hash');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
