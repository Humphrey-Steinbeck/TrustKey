# TrustKey API Documentation

## Overview

TrustKey provides a comprehensive REST API for managing decentralized identities, verifiable credentials, and reputation systems. The API is built on modern web standards and follows RESTful principles.

## Base URL

```
Production: https://api.trustkey.io
Development: http://localhost:3000
```

## Authentication

TrustKey uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

1. Connect your wallet (MetaMask)
2. Sign an authentication message
3. Send the signature to the login endpoint
4. Receive your JWT token

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Identity Operations**: 20 requests per 5 minutes
- **Read Operations**: 100 requests per minute

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

## API Endpoints

### Authentication

#### POST /api/auth/login

Authenticate user with wallet signature.

**Request Body:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "signature": "0x...",
  "message": "TrustKey Authentication..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "address": "0x1234567890123456789012345678901234567890",
      "hasIdentity": true,
      "role": "user"
    }
  }
}
```

#### POST /api/auth/register

Register a new user.

**Request Body:** Same as login

**Response:** Same as login

#### POST /api/auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here"
  }
}
```

#### GET /api/auth/me

Get current user information.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "address": "0x1234567890123456789012345678901234567890",
      "role": "user"
    },
    "identity": {
      "identityId": "urn:trustkey:credential:12345",
      "isActive": true,
      "credentialHash": "0x...",
      "metadataURI": "ipfs://Qm..."
    },
    "reputation": {
      "totalScore": 750,
      "trustLevel": 4,
      "positiveEvents": 15,
      "negativeEvents": 2
    }
  }
}
```

### Identity Management

#### GET /api/identity/:address

Get identity information by wallet address.

**Parameters:**
- `address` (string): Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "identityId": "urn:trustkey:credential:12345",
    "wallet": "0x1234567890123456789012345678901234567890",
    "credentialHash": "0x...",
    "timestamp": "2023-12-01T10:00:00Z",
    "isActive": true,
    "metadataURI": "ipfs://Qm...",
    "metadata": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST /api/identity/register

Register a new identity.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "credentialData": {
    "type": "IdentityCredential",
    "expirationDate": "2024-12-01T10:00:00Z",
    "properties": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  },
  "metadata": {
    "additionalInfo": "Any additional metadata"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Identity registered successfully",
  "data": {
    "identityId": "urn:trustkey:credential:12345",
    "credentialHash": "0x...",
    "metadataURI": "ipfs://Qm...",
    "transactionHash": "0x...",
    "blockNumber": 12345
  }
}
```

#### PUT /api/identity/update

Update existing identity.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:** Same as register

**Response:** Same as register

#### DELETE /api/identity/deactivate

Deactivate identity.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Identity deactivated successfully",
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12345
  }
}
```

#### GET /api/identity/:address/status

Check if identity exists and is active.

**Parameters:**
- `address` (string): Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "hasActiveIdentity": true,
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

### Credential Management

#### POST /api/credential/generate

Generate a new verifiable credential.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "type": "IdentityCredential",
  "subject": {
    "id": "did:ethr:0x1234567890123456789012345678901234567890",
    "type": "Person",
    "properties": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  },
  "expirationDate": "2024-12-01T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credential generated successfully",
  "data": {
    "credential": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "urn:trustkey:credential:12345",
      "type": ["VerifiableCredential", "IdentityCredential"],
      "issuer": "did:ethr:0x...",
      "issuanceDate": "2023-12-01T10:00:00Z",
      "credentialSubject": {
        "id": "did:ethr:0x...",
        "type": "Person",
        "name": "John Doe"
      }
    },
    "credentialHash": "0x...",
    "metadataURI": "ipfs://Qm...",
    "id": "urn:trustkey:credential:12345"
  }
}
```

#### POST /api/credential/verify

Verify a verifiable credential.

**Request Body:**
```json
{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "urn:trustkey:credential:12345",
    "type": ["VerifiableCredential", "IdentityCredential"],
    "issuer": "did:ethr:0x...",
    "credentialSubject": {
      "id": "did:ethr:0x...",
      "name": "John Doe"
    }
  },
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "jws": "eyJ..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "credentialHash": "0x...",
    "existsOnChain": true,
    "proofValid": true,
    "validation": {
      "structure": true,
      "blockchain": true,
      "proof": true
    },
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### GET /api/credential/:hash

Get credential information by hash.

**Parameters:**
- `hash` (string): Credential hash

**Response:**
```json
{
  "success": true,
  "data": {
    "credentialHash": "0x...",
    "existsOnChain": true,
    "identityData": {
      "identityId": "urn:trustkey:credential:12345",
      "wallet": "0x...",
      "isActive": true
    },
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### POST /api/credential/validate

Validate credential structure and format.

**Request Body:**
```json
{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "urn:trustkey:credential:12345",
    "type": ["VerifiableCredential", "IdentityCredential"],
    "issuer": "did:ethr:0x...",
    "credentialSubject": {
      "id": "did:ethr:0x...",
      "name": "John Doe"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "credentialId": "urn:trustkey:credential:12345",
    "credentialType": ["VerifiableCredential", "IdentityCredential"],
    "issuer": "did:ethr:0x...",
    "subject": {
      "id": "did:ethr:0x...",
      "name": "John Doe"
    },
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

### Reputation System

#### GET /api/reputation/:address

Get reputation data for a wallet address.

**Parameters:**
- `address` (string): Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "totalScore": 750,
    "trustLevel": 4,
    "trustLevelLabel": "Highly Trusted",
    "lastUpdated": "2023-12-01T10:00:00Z",
    "positiveEvents": 15,
    "negativeEvents": 2,
    "isActive": true,
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### POST /api/reputation/issue-event

Issue a reputation event.

**Headers:** `Authorization: Bearer YOUR_TOKEN` (Requires issuer role)

**Request Body:**
```json
{
  "targetWallet": "0x1234567890123456789012345678901234567890",
  "scoreChange": 25,
  "eventType": "verification_completed",
  "description": "Successfully verified identity credential",
  "proofHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reputation event issued successfully",
  "data": {
    "targetWallet": "0x1234567890123456789012345678901234567890",
    "scoreChange": 25,
    "eventType": "verification_completed",
    "description": "Successfully verified identity credential",
    "issuer": "0x...",
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### GET /api/reputation/:address/events

Get reputation events for a wallet.

**Parameters:**
- `address` (string): Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "events": [
      {
        "eventId": "1",
        "type": "verification_completed",
        "description": "Successfully verified identity credential",
        "scoreChange": 25,
        "timestamp": "2023-12-01T10:00:00Z",
        "issuer": "0x...",
        "proofHash": "0x..."
      }
    ],
    "count": 1,
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

### Verification System

#### POST /api/verification/request

Request credential verification.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "credentialHash": "0x...",
  "verificationType": "identity_verification",
  "proof": [1, 2, 3, 4, 5, 6, 7, 8],
  "publicSignals": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification request submitted successfully",
  "data": {
    "credentialHash": "0x...",
    "verificationType": "identity_verification",
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### POST /api/verification/generate-proof

Generate ZKP proof for credential.

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "urn:trustkey:credential:12345",
    "type": ["VerifiableCredential", "IdentityCredential"],
    "issuer": "did:ethr:0x...",
    "credentialSubject": {
      "id": "did:ethr:0x...",
      "name": "John Doe"
    }
  },
  "privateInputs": {
    "issuerPublicKey": "0x...",
    "subjectPublicKey": "0x..."
  },
  "circuitType": "credential_verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ZKP proof generated successfully",
  "data": {
    "proof": [1, 2, 3, 4, 5, 6, 7, 8],
    "publicSignals": ["1", "2"],
    "circuitType": "credential_verification",
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### POST /api/verification/verify-proof

Verify ZKP proof.

**Request Body:**
```json
{
  "proof": [1, 2, 3, 4, 5, 6, 7, 8],
  "publicSignals": ["1", "2"],
  "circuitType": "credential_verification"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "circuitType": "credential_verification",
    "timestamp": "2023-12-01T10:00:00Z"
  }
}
```

#### GET /api/verification/circuits

Get available verification circuits.

**Response:**
```json
{
  "success": true,
  "data": {
    "circuits": [
      {
        "type": "credential_verification",
        "info": {
          "name": "Credential Verification",
          "description": "Verify ownership of a verifiable credential",
          "inputs": ["credentialHash", "privateHash", "issuerPublicKey", "subjectPublicKey"],
          "outputs": ["isValid", "timestamp"]
        }
      }
    ],
    "count": 1
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```javascript
import { TrustKeyAPI } from '@trustkey/api-sdk';

const api = new TrustKeyAPI({
  baseURL: 'https://api.trustkey.io',
  apiKey: 'your-api-key'
});

// Authenticate
const authResult = await api.auth.login({
  address: '0x...',
  signature: '0x...',
  message: 'TrustKey Authentication...'
});

// Generate credential
const credential = await api.credential.generate({
  type: 'IdentityCredential',
  subject: {
    id: 'did:ethr:0x...',
    type: 'Person',
    properties: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
});

// Verify credential
const verification = await api.credential.verify({
  credential: credential.data.credential
});
```

### Python

```python
from trustkey import TrustKeyAPI

api = TrustKeyAPI(
    base_url='https://api.trustkey.io',
    api_key='your-api-key'
)

# Authenticate
auth_result = api.auth.login({
    'address': '0x...',
    'signature': '0x...',
    'message': 'TrustKey Authentication...'
})

# Generate credential
credential = api.credential.generate({
    'type': 'IdentityCredential',
    'subject': {
        'id': 'did:ethr:0x...',
        'type': 'Person',
        'properties': {
            'name': 'John Doe',
            'email': 'john@example.com'
        }
    }
})

# Verify credential
verification = api.credential.verify({
    'credential': credential['data']['credential']
})
```

## Webhooks

TrustKey supports webhooks for real-time notifications. Configure webhooks in your dashboard to receive events:

- `identity.registered`
- `identity.updated`
- `identity.deactivated`
- `credential.generated`
- `credential.verified`
- `reputation.event_issued`
- `verification.requested`
- `verification.completed`

## Support

For API support and questions:
- Email: api-support@trustkey.io
- Documentation: https://docs.trustkey.io
- GitHub Issues: https://github.com/Humphrey-Steinbeck/TrustKey/issues
