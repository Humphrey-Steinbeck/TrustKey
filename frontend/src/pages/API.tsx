import React, { useState } from 'react';
import { Code, Copy, Play, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: any[];
  example?: any;
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user with wallet signature',
    parameters: [
      { name: 'address', type: 'string', required: true, description: 'Wallet address' },
      { name: 'signature', type: 'string', required: true, description: 'Signed message' },
      { name: 'message', type: 'string', required: true, description: 'Original message' }
    ],
    example: {
      address: '0x1234567890123456789012345678901234567890',
      signature: '0x...',
      message: 'TrustKey Authentication...'
    }
  },
  {
    method: 'GET',
    path: '/api/identity/:address',
    description: 'Get identity information by wallet address',
    parameters: [
      { name: 'address', type: 'string', required: true, description: 'Wallet address' }
    ],
    example: {
      identityId: 'urn:trustkey:credential:12345',
      wallet: '0x1234...5678',
      credentialHash: '0x...',
      isActive: true
    }
  },
  {
    method: 'POST',
    path: '/api/credential/generate',
    description: 'Generate a new verifiable credential',
    parameters: [
      { name: 'type', type: 'string', required: true, description: 'Credential type' },
      { name: 'subject', type: 'object', required: true, description: 'Credential subject' },
      { name: 'expirationDate', type: 'string', required: false, description: 'Expiration date' }
    ],
    example: {
      type: 'IdentityCredential',
      subject: {
        id: 'did:ethr:0x...',
        type: 'Person',
        properties: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/credential/verify',
    description: 'Verify a verifiable credential',
    parameters: [
      { name: 'credential', type: 'object', required: true, description: 'Credential data' },
      { name: 'proof', type: 'object', required: false, description: 'ZKP proof' }
    ],
    example: {
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'IdentityCredential'],
        issuer: 'did:ethr:0x...',
        credentialSubject: {
          id: 'did:ethr:0x...',
          name: 'John Doe'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/reputation/:address',
    description: 'Get reputation data for a wallet',
    parameters: [
      { name: 'address', type: 'string', required: true, description: 'Wallet address' }
    ],
    example: {
      totalScore: 750,
      trustLevel: 4,
      positiveEvents: 15,
      negativeEvents: 2
    }
  },
  {
    method: 'POST',
    path: '/api/verification/request',
    description: 'Request credential verification',
    parameters: [
      { name: 'credentialHash', type: 'string', required: true, description: 'Credential hash' },
      { name: 'verificationType', type: 'string', required: true, description: 'Type of verification' },
      { name: 'proof', type: 'array', required: true, description: 'ZKP proof components' },
      { name: 'publicSignals', type: 'array', required: true, description: 'Public signals' }
    ],
    example: {
      credentialHash: '0x...',
      verificationType: 'identity_verification',
      proof: [1, 2, 3, 4, 5, 6, 7, 8],
      publicSignals: [1, 2]
    }
  }
];

export default function API() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateCurlExample = (endpoint: ApiEndpoint) => {
    const baseUrl = 'https://api.trustkey.io';
    let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
    
    if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.example, null, 2)}'`;
    }
    
    return curl;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            API Documentation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Integrate TrustKey into your applications using our REST API
          </p>
        </div>
      </div>

      {/* API Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    API Status
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    Operational
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Code className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Base URL
                  </dt>
                  <dd className="text-sm font-mono text-gray-900">
                    api.trustkey.io
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rate Limit
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    100/min
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Endpoints List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-gray-200">
              {apiEndpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                    selectedEndpoint === endpoint ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <span className="ml-3 text-sm font-mono text-gray-900">
                        {endpoint.path}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(endpoint.path, endpoint.path);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedEndpoint === endpoint.path ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {endpoint.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Endpoint Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedEndpoint ? 'Endpoint Details' : 'Select an endpoint'}
            </h3>
          </div>
          <div className="card-body">
            {selectedEndpoint ? (
              <div className="space-y-6">
                {/* Method and Path */}
                <div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="text-sm font-mono text-gray-900">
                      {selectedEndpoint.path}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedEndpoint.description}
                  </p>
                </div>

                {/* Parameters */}
                {selectedEndpoint.parameters && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Parameters</h4>
                    <div className="space-y-2">
                      {selectedEndpoint.parameters.map((param, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            param.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {param.type}
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{param.name}</span>
                            <p className="text-sm text-gray-500">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                {selectedEndpoint.example && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Example Request</h4>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.example, null, 2), 'example')}
                        className="btn btn-sm btn-secondary"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                      <code>{JSON.stringify(selectedEndpoint.example, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {/* cURL Example */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">cURL Example</h4>
                    <button
                      onClick={() => copyToClipboard(generateCurlExample(selectedEndpoint), 'curl')}
                      className="btn btn-sm btn-secondary"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                    <code>{generateCurlExample(selectedEndpoint)}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No endpoint selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click on an endpoint from the list to view its details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              TrustKey API uses JWT tokens for authentication. Include the token in the Authorization header:
            </p>
            <pre className="bg-gray-100 rounded-lg p-4 text-sm">
              <code>Authorization: Bearer YOUR_JWT_TOKEN</code>
            </pre>
            <p className="text-sm text-gray-600">
              To obtain a token, authenticate with your wallet signature using the login endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
