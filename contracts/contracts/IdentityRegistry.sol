// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IdentityRegistry
 * @dev Registry for managing decentralized identities and credential hashes
 * @notice This contract stores only hashes of credentials, ensuring privacy
 */
contract IdentityRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _identityCounter;
    
    // Struct to represent a user identity
    struct Identity {
        address wallet;
        bytes32 credentialHash;
        uint256 timestamp;
        bool isActive;
        string metadataURI; // IPFS URI for additional metadata
    }
    
    // Mapping from identity ID to Identity struct
    mapping(uint256 => Identity) public identities;
    
    // Mapping from wallet address to identity ID
    mapping(address => uint256) public walletToIdentity;
    
    // Mapping from credential hash to identity ID (prevents duplicate credentials)
    mapping(bytes32 => uint256) public hashToIdentity;
    
    // Events
    event IdentityRegistered(
        uint256 indexed identityId,
        address indexed wallet,
        bytes32 credentialHash,
        uint256 timestamp
    );
    
    event IdentityUpdated(
        uint256 indexed identityId,
        address indexed wallet,
        bytes32 newCredentialHash,
        uint256 timestamp
    );
    
    event IdentityDeactivated(
        uint256 indexed identityId,
        address indexed wallet,
        uint256 timestamp
    );
    
    event MetadataUpdated(
        uint256 indexed identityId,
        string newMetadataURI
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new identity with credential hash
     * @param credentialHash Hash of the verifiable credential
     * @param metadataURI IPFS URI for additional metadata
     */
    function registerIdentity(
        bytes32 credentialHash,
        string memory metadataURI
    ) external nonReentrant {
        require(credentialHash != bytes32(0), "Invalid credential hash");
        require(walletToIdentity[msg.sender] == 0, "Identity already exists");
        require(hashToIdentity[credentialHash] == 0, "Credential hash already used");
        
        _identityCounter.increment();
        uint256 identityId = _identityCounter.current();
        
        identities[identityId] = Identity({
            wallet: msg.sender,
            credentialHash: credentialHash,
            timestamp: block.timestamp,
            isActive: true,
            metadataURI: metadataURI
        });
        
        walletToIdentity[msg.sender] = identityId;
        hashToIdentity[credentialHash] = identityId;
        
        emit IdentityRegistered(identityId, msg.sender, credentialHash, block.timestamp);
    }
    
    /**
     * @dev Update credential hash for existing identity
     * @param newCredentialHash New credential hash
     * @param newMetadataURI New metadata URI
     */
    function updateIdentity(
        bytes32 newCredentialHash,
        string memory newMetadataURI
    ) external nonReentrant {
        uint256 identityId = walletToIdentity[msg.sender];
        require(identityId != 0, "Identity not found");
        require(identities[identityId].isActive, "Identity is deactivated");
        require(newCredentialHash != bytes32(0), "Invalid credential hash");
        require(hashToIdentity[newCredentialHash] == 0, "Credential hash already used");
        
        // Remove old hash mapping
        bytes32 oldHash = identities[identityId].credentialHash;
        delete hashToIdentity[oldHash];
        
        // Update identity
        identities[identityId].credentialHash = newCredentialHash;
        identities[identityId].metadataURI = newMetadataURI;
        identities[identityId].timestamp = block.timestamp;
        
        // Add new hash mapping
        hashToIdentity[newCredentialHash] = identityId;
        
        emit IdentityUpdated(identityId, msg.sender, newCredentialHash, block.timestamp);
    }
    
    /**
     * @dev Deactivate an identity
     */
    function deactivateIdentity() external {
        uint256 identityId = walletToIdentity[msg.sender];
        require(identityId != 0, "Identity not found");
        require(identities[identityId].isActive, "Identity already deactivated");
        
        identities[identityId].isActive = false;
        
        emit IdentityDeactivated(identityId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get identity information by wallet address
     * @param wallet Wallet address
     * @return identityId Identity ID
     * @return credentialHash Credential hash
     * @return timestamp Registration timestamp
     * @return isActive Active status
     * @return metadataURI Metadata URI
     */
    function getIdentityByWallet(address wallet) external view returns (
        uint256 identityId,
        bytes32 credentialHash,
        uint256 timestamp,
        bool isActive,
        string memory metadataURI
    ) {
        identityId = walletToIdentity[wallet];
        if (identityId != 0) {
            Identity memory identity = identities[identityId];
            credentialHash = identity.credentialHash;
            timestamp = identity.timestamp;
            isActive = identity.isActive;
            metadataURI = identity.metadataURI;
        }
    }
    
    /**
     * @dev Get identity information by credential hash
     * @param credentialHash Credential hash
     * @return identityId Identity ID
     * @return wallet Wallet address
     * @return timestamp Registration timestamp
     * @return isActive Active status
     * @return metadataURI Metadata URI
     */
    function getIdentityByHash(bytes32 credentialHash) external view returns (
        uint256 identityId,
        address wallet,
        uint256 timestamp,
        bool isActive,
        string memory metadataURI
    ) {
        identityId = hashToIdentity[credentialHash];
        if (identityId != 0) {
            Identity memory identity = identities[identityId];
            wallet = identity.wallet;
            timestamp = identity.timestamp;
            isActive = identity.isActive;
            metadataURI = identity.metadataURI;
        }
    }
    
    /**
     * @dev Get total number of registered identities
     * @return Total count
     */
    function getTotalIdentities() external view returns (uint256) {
        return _identityCounter.current();
    }
    
    /**
     * @dev Check if a wallet has a registered identity
     * @param wallet Wallet address
     * @return True if identity exists and is active
     */
    function hasActiveIdentity(address wallet) external view returns (bool) {
        uint256 identityId = walletToIdentity[wallet];
        return identityId != 0 && identities[identityId].isActive;
    }
    
    /**
     * @dev Verify credential hash exists and is active
     * @param credentialHash Credential hash to verify
     * @return True if hash exists and identity is active
     */
    function verifyCredentialHash(bytes32 credentialHash) external view returns (bool) {
        uint256 identityId = hashToIdentity[credentialHash];
        return identityId != 0 && identities[identityId].isActive;
    }
}
