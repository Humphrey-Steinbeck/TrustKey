# Contributing to TrustKey

Thank you for your interest in contributing to TrustKey! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Security](#security)
- [Community Guidelines](#community-guidelines)

## Code of Conduct

TrustKey is committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible wallet
- Basic understanding of blockchain and web3 technologies

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TrustKey.git
   cd TrustKey
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Humphrey-Steinbeck/TrustKey.git
   ```

## Development Setup

### 1. Install Dependencies

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

### 2. Environment Setup

Create environment files for each component:

#### Backend (.env)
```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your-development-secret
ETHEREUM_RPC_URL=http://localhost:8545
IPFS_HOST=localhost
IPFS_PORT=5001
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_NETWORK=localhost
REACT_APP_CHAIN_ID=1337
```

### 3. Start Development Environment

```bash
# Start IPFS (if not already running)
ipfs daemon

# Start local blockchain
cd contracts
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Start backend (in another terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start
```

## Contributing Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run smart contract tests
cd contracts
npm test

# Run backend tests
cd ../backend
npm test

# Run frontend tests
cd ../frontend
npm test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions
- `refactor:` for code refactoring
- `style:` for formatting changes
- `chore:` for maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear description of changes
- Reference to related issues
- Screenshots (if applicable)
- Testing instructions

## Coding Standards

### JavaScript/TypeScript

#### ESLint Configuration
```json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "error",
    "no-console": "warn"
  }
}
```

#### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

#### Example:
```javascript
/**
 * Generates a verifiable credential
 * @param {Object} credentialData - The credential data
 * @param {string} issuerAddress - The issuer's wallet address
 * @returns {Promise<Object>} The generated credential
 */
async function generateCredential(credentialData, issuerAddress) {
  try {
    const credential = new VerifiableCredential({
      type: credentialData.type,
      issuer: issuerAddress,
      credentialSubject: credentialData.subject
    });
    
    return credential.toJsonLd();
  } catch (error) {
    throw new Error(`Failed to generate credential: ${error.message}`);
  }
}
```

### Solidity

#### Style Guide
- Use 4 spaces for indentation
- Use camelCase for functions and variables
- Use PascalCase for contracts and structs
- Add NatSpec documentation
- Use events for important state changes

#### Example:
```solidity
/**
 * @title IdentityRegistry
 * @dev Registry for managing decentralized identities
 */
contract IdentityRegistry is Ownable, ReentrancyGuard {
    // Events
    event IdentityRegistered(
        uint256 indexed identityId,
        address indexed wallet,
        bytes32 credentialHash,
        uint256 timestamp
    );
    
    /**
     * @dev Register a new identity
     * @param credentialHash Hash of the verifiable credential
     * @param metadataURI IPFS URI for additional metadata
     */
    function registerIdentity(
        bytes32 credentialHash,
        string memory metadataURI
    ) external nonReentrant {
        require(credentialHash != bytes32(0), "Invalid credential hash");
        // Implementation
    }
}
```

### React/TypeScript

#### Component Structure
```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ComponentProps {
  title: string;
  onAction: (data: any) => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [data, setData] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    // Effect logic
  }, []);

  const handleAction = () => {
    onAction(data);
  };

  return (
    <div className="component">
      <h1>{title}</h1>
      <button onClick={handleAction}>Action</button>
    </div>
  );
};
```

## Testing

### Smart Contract Testing

```javascript
describe('IdentityRegistry', function () {
  let identityRegistry;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry');
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.deployed();
  });

  it('Should register identity successfully', async function () {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('test'));
    
    await expect(identityRegistry.connect(user1).registerIdentity(credentialHash, 'ipfs://QmTest'))
      .to.emit(identityRegistry, 'IdentityRegistered');
  });
});
```

### Backend Testing

```javascript
describe('Authentication API', () => {
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
  });
});
```

### Frontend Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders with title', () => {
    render(<Component title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter types and return types
- Provide usage examples
- Document error conditions

### README Updates

- Update installation instructions
- Add new features to feature list
- Update configuration examples
- Include troubleshooting information

### API Documentation

- Document all new endpoints
- Include request/response examples
- Add error codes and messages
- Update authentication requirements

## Security

### Security Considerations

- Never commit private keys or secrets
- Validate all inputs
- Use secure coding practices
- Follow OWASP guidelines
- Test for common vulnerabilities

### Security Testing

```bash
# Run security audits
npm audit
npx snyk test

# Check for vulnerabilities
npx audit-ci
```

### Reporting Security Issues

- Email: security@trustkey.io
- Use responsible disclosure
- Do not create public issues for security vulnerabilities
- Include detailed reproduction steps

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use clear and concise language
- Provide constructive feedback
- Help others learn and grow

### Issue Reporting

When reporting issues:
- Use the issue template
- Provide clear reproduction steps
- Include environment details
- Add relevant logs or screenshots

### Feature Requests

When requesting features:
- Check existing issues first
- Provide clear use case
- Explain the expected behavior
- Consider implementation complexity

## Review Process

### Pull Request Review

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Team members review code
3. **Security Review**: Security team checks for vulnerabilities
4. **Documentation Review**: Ensure documentation is updated
5. **Final Approval**: Maintainer approves and merges

### Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- Security considerations
- Performance impact
- Backward compatibility

## Recognition

### Contributors

- All contributors are recognized in CONTRIBUTORS.md
- Significant contributors may be invited to join the core team
- Contributors receive TrustKey NFTs as recognition

### Contribution Types

- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Community support
- Security research

## Getting Help

### Resources

- Documentation: [docs.trustkey.io](https://docs.trustkey.io)
- Discord: [discord.gg/trustkey](https://discord.gg/trustkey)
- GitHub Discussions: [GitHub Discussions](https://github.com/Humphrey-Steinbeck/TrustKey/discussions)
- Email: [contributors@trustkey.io](mailto:contributors@trustkey.io)

### Mentorship

- New contributors can request mentorship
- Experienced contributors can volunteer as mentors
- Mentorship program helps with onboarding

## License

By contributing to TrustKey, you agree that your contributions will be licensed under the MIT License.

## Thank You

Thank you for contributing to TrustKey! Your contributions help build a more secure, private, and decentralized future for digital identity.
