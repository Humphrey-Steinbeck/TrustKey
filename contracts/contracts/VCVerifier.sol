// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IdentityRegistry.sol";

/**
 * @title VCVerifier
 * @dev Verifies Zero-Knowledge Proofs for Verifiable Credentials
 * @notice This contract handles zk-SNARK proof verification for credential ownership
 */
contract VCVerifier is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _verificationCounter;
    
    // Reference to IdentityRegistry contract
    IdentityRegistry public immutable identityRegistry;
    
    // Struct to represent a verification request
    struct VerificationRequest {
        uint256 requestId;
        address requester;
        bytes32 credentialHash;
        uint256[8] proof; // zk-SNARK proof components
        uint256[2] publicSignals; // Public signals for verification
        bool isVerified;
        uint256 timestamp;
        string verificationType;
        bytes32 verificationHash; // Hash of the verification result
    }
    
    // Struct to represent verification parameters
    struct VerificationParams {
        uint256[2] publicSignals;
        uint256[8] proof;
        string credentialType;
        string[] requiredAttributes;
    }
    
    // Mapping from request ID to verification request
    mapping(uint256 => VerificationRequest) public verificationRequests;
    
    // Mapping from credential hash to verification status
    mapping(bytes32 => bool) public credentialVerificationStatus;
    
    // Mapping from credential hash to verification count
    mapping(bytes32 => uint256) public credentialVerificationCount;
    
    // Authorized verifiers (can perform verifications)
    mapping(address => bool) public authorizedVerifiers;
    
    // Trusted credential issuers
    mapping(address => bool) public trustedIssuers;
    
    // Verification types and their requirements
    mapping(string => string[]) public verificationTypeRequirements;
    
    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        address indexed requester,
        bytes32 credentialHash,
        string verificationType,
        uint256 timestamp
    );
    
    event VerificationCompleted(
        uint256 indexed requestId,
        address indexed requester,
        bytes32 credentialHash,
        bool isVerified,
        uint256 timestamp
    );
    
    event AuthorizedVerifierAdded(address indexed verifier);
    event AuthorizedVerifierRemoved(address indexed verifier);
    
    event TrustedIssuerAdded(address indexed issuer);
    event TrustedIssuerRemoved(address indexed issuer);
    
    event VerificationTypeConfigured(string indexed verificationType, string[] requirements);
    
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    modifier onlyRegisteredIdentity(address wallet) {
        require(identityRegistry.hasActiveIdentity(wallet), "Identity not registered or inactive");
        _;
    }
    
    constructor(address _identityRegistry) Ownable(msg.sender) {
        identityRegistry = IdentityRegistry(_identityRegistry);
        authorizedVerifiers[msg.sender] = true; // Owner is automatically authorized
        
        // Initialize default verification types
        verificationTypeRequirements["age_verification"] = ["age", "dateOfBirth"];
        verificationTypeRequirements["kyc_verification"] = ["name", "email", "phone"];
        verificationTypeRequirements["reputation_verification"] = ["reputationScore", "trustLevel"];
    }
    
    /**
     * @dev Add an authorized verifier
     * @param verifier Address of the verifier to authorize
     */
    function addAuthorizedVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
        emit AuthorizedVerifierAdded(verifier);
    }
    
    /**
     * @dev Remove an authorized verifier
     * @param verifier Address of the verifier to remove
     */
    function removeAuthorizedVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit AuthorizedVerifierRemoved(verifier);
    }
    
    /**
     * @dev Add a trusted credential issuer
     * @param issuer Address of the issuer to trust
     */
    function addTrustedIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        trustedIssuers[issuer] = true;
        emit TrustedIssuerAdded(issuer);
    }
    
    /**
     * @dev Remove a trusted credential issuer
     * @param issuer Address of the issuer to remove
     */
    function removeTrustedIssuer(address issuer) external onlyOwner {
        trustedIssuers[issuer] = false;
        emit TrustedIssuerRemoved(issuer);
    }
    
    /**
     * @dev Configure verification type requirements
     * @param verificationType Type of verification
     * @param requirements Array of required attributes
     */
    function configureVerificationType(
        string memory verificationType,
        string[] memory requirements
    ) external onlyOwner {
        require(bytes(verificationType).length > 0, "Verification type cannot be empty");
        verificationTypeRequirements[verificationType] = requirements;
        emit VerificationTypeConfigured(verificationType, requirements);
    }
    
    /**
     * @dev Request credential verification
     * @param credentialHash Hash of the credential to verify
     * @param verificationType Type of verification requested
     * @param proof zk-SNARK proof components
     * @param publicSignals Public signals for verification
     */
    function requestVerification(
        bytes32 credentialHash,
        string memory verificationType,
        uint256[8] memory proof,
        uint256[2] memory publicSignals
    ) external onlyRegisteredIdentity(msg.sender) nonReentrant {
        require(credentialHash != bytes32(0), "Invalid credential hash");
        require(bytes(verificationType).length > 0, "Verification type cannot be empty");
        require(identityRegistry.verifyCredentialHash(credentialHash), "Credential hash not found or inactive");
        
        _verificationCounter.increment();
        uint256 requestId = _verificationCounter.current();
        
        // Create verification request
        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            requester: msg.sender,
            credentialHash: credentialHash,
            proof: proof,
            publicSignals: publicSignals,
            isVerified: false,
            timestamp: block.timestamp,
            verificationType: verificationType,
            verificationHash: bytes32(0)
        });
        
        emit VerificationRequested(requestId, msg.sender, credentialHash, verificationType, block.timestamp);
    }
    
    /**
     * @dev Complete verification process
     * @param requestId ID of the verification request
     * @param isVerified Whether the verification was successful
     * @param verificationHash Hash of the verification result
     */
    function completeVerification(
        uint256 requestId,
        bool isVerified,
        bytes32 verificationHash
    ) external onlyAuthorizedVerifier {
        require(requestId > 0 && requestId <= _verificationCounter.current(), "Invalid request ID");
        require(verificationRequests[requestId].timestamp > 0, "Request not found");
        require(!verificationRequests[requestId].isVerified, "Request already processed");
        
        VerificationRequest storage request = verificationRequests[requestId];
        request.isVerified = isVerified;
        request.verificationHash = verificationHash;
        
        // Update credential verification status
        if (isVerified) {
            credentialVerificationStatus[request.credentialHash] = true;
            credentialVerificationCount[request.credentialHash]++;
        }
        
        emit VerificationCompleted(requestId, request.requester, request.credentialHash, isVerified, block.timestamp);
    }
    
    /**
     * @dev Verify zk-SNARK proof (simplified version - in production, use proper zk-SNARK verification)
     * @param proof Proof components
     * @param publicSignals Public signals
     * @return True if proof is valid
     */
    function verifyProof(
        uint256[8] memory proof,
        uint256[2] memory publicSignals
    ) public pure returns (bool) {
        // This is a simplified verification function
        // In production, this would use proper zk-SNARK verification libraries
        // For now, we'll implement basic checks
        
        // Check that proof components are non-zero
        for (uint256 i = 0; i < 8; i++) {
            if (proof[i] == 0) {
                return false;
            }
        }
        
        // Check that public signals are valid
        for (uint256 i = 0; i < 2; i++) {
            if (publicSignals[i] == 0) {
                return false;
            }
        }
        
        // Additional verification logic would go here
        // This is a placeholder for actual zk-SNARK verification
        
        return true;
    }
    
    /**
     * @dev Get verification request details
     * @param requestId Request ID
     * @return requestData Verification request data
     */
    function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory) {
        return verificationRequests[requestId];
    }
    
    /**
     * @dev Get credential verification status
     * @param credentialHash Credential hash
     * @return isVerified Whether credential is verified
     * @return verificationCount Number of times verified
     */
    function getCredentialVerificationStatus(bytes32 credentialHash) external view returns (
        bool isVerified,
        uint256 verificationCount
    ) {
        return (
            credentialVerificationStatus[credentialHash],
            credentialVerificationCount[credentialHash]
        );
    }
    
    /**
     * @dev Get verification type requirements
     * @param verificationType Type of verification
     * @return requirements Array of required attributes
     */
    function getVerificationTypeRequirements(string memory verificationType) external view returns (string[] memory) {
        return verificationTypeRequirements[verificationType];
    }
    
    /**
     * @dev Get total number of verification requests
     * @return Total count
     */
    function getTotalVerificationRequests() external view returns (uint256) {
        return _verificationCounter.current();
    }
    
    /**
     * @dev Check if a credential is verified
     * @param credentialHash Credential hash
     * @return True if credential is verified
     */
    function isCredentialVerified(bytes32 credentialHash) external view returns (bool) {
        return credentialVerificationStatus[credentialHash];
    }
    
    /**
     * @dev Batch verify multiple credentials
     * @param credentialHashes Array of credential hashes
     * @return verificationStatuses Array of verification statuses
     */
    function batchVerifyCredentials(bytes32[] memory credentialHashes) external view returns (bool[] memory) {
        bool[] memory verificationStatuses = new bool[](credentialHashes.length);
        
        for (uint256 i = 0; i < credentialHashes.length; i++) {
            verificationStatuses[i] = credentialVerificationStatus[credentialHashes[i]];
        }
        
        return verificationStatuses;
    }
}
