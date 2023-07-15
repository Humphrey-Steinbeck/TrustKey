// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IdentityRegistry.sol";

/**
 * @title ReputationScore
 * @dev Manages reputation scores and trust levels for registered identities
 * @notice Reputation scores are calculated based on various trust factors
 */
contract ReputationScore is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _reputationEventCounter;
    
    // Reference to IdentityRegistry contract
    IdentityRegistry public immutable identityRegistry;
    
    // Struct to represent a reputation score
    struct ReputationData {
        uint256 totalScore;
        uint256 trustLevel; // 1-5 scale
        uint256 lastUpdated;
        uint256 positiveEvents;
        uint256 negativeEvents;
        bool isActive;
    }
    
    // Struct to represent a reputation event
    struct ReputationEvent {
        uint256 eventId;
        address targetWallet;
        address issuerWallet;
        int256 scoreChange;
        string eventType;
        string description;
        uint256 timestamp;
        bytes32 proofHash; // Hash of the proof/evidence
    }
    
    // Mapping from wallet address to reputation data
    mapping(address => ReputationData) public reputationScores;
    
    // Mapping from event ID to reputation event
    mapping(uint256 => ReputationEvent) public reputationEvents;
    
    // Mapping from wallet to array of event IDs
    mapping(address => uint256[]) public walletEvents;
    
    // Trust level thresholds
    uint256 public constant TRUST_LEVEL_1_THRESHOLD = 0;
    uint256 public constant TRUST_LEVEL_2_THRESHOLD = 100;
    uint256 public constant TRUST_LEVEL_3_THRESHOLD = 300;
    uint256 public constant TRUST_LEVEL_4_THRESHOLD = 600;
    uint256 public constant TRUST_LEVEL_5_THRESHOLD = 1000;
    
    // Maximum score change per event
    int256 public constant MAX_SCORE_CHANGE = 50;
    int256 public constant MIN_SCORE_CHANGE = -50;
    
    // Authorized issuers (can issue reputation events)
    mapping(address => bool) public authorizedIssuers;
    
    // Events
    event ReputationEventIssued(
        uint256 indexed eventId,
        address indexed targetWallet,
        address indexed issuerWallet,
        int256 scoreChange,
        string eventType,
        uint256 newTotalScore,
        uint256 newTrustLevel
    );
    
    event TrustLevelUpdated(
        address indexed wallet,
        uint256 oldTrustLevel,
        uint256 newTrustLevel,
        uint256 totalScore
    );
    
    event AuthorizedIssuerAdded(address indexed issuer);
    event AuthorizedIssuerRemoved(address indexed issuer);
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized issuer");
        _;
    }
    
    modifier onlyRegisteredIdentity(address wallet) {
        require(identityRegistry.hasActiveIdentity(wallet), "Identity not registered or inactive");
        _;
    }
    
    constructor(address _identityRegistry) Ownable(msg.sender) {
        identityRegistry = IdentityRegistry(_identityRegistry);
        authorizedIssuers[msg.sender] = true; // Owner is automatically authorized
    }
    
    /**
     * @dev Add an authorized issuer
     * @param issuer Address of the issuer to authorize
     */
    function addAuthorizedIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit AuthorizedIssuerAdded(issuer);
    }
    
    /**
     * @dev Remove an authorized issuer
     * @param issuer Address of the issuer to remove
     */
    function removeAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit AuthorizedIssuerRemoved(issuer);
    }
    
    /**
     * @dev Issue a reputation event
     * @param targetWallet Target wallet address
     * @param scoreChange Score change (positive or negative)
     * @param eventType Type of event (e.g., "verification", "transaction", "review")
     * @param description Description of the event
     * @param proofHash Hash of the proof/evidence
     */
    function issueReputationEvent(
        address targetWallet,
        int256 scoreChange,
        string memory eventType,
        string memory description,
        bytes32 proofHash
    ) external onlyAuthorizedIssuer onlyRegisteredIdentity(targetWallet) nonReentrant {
        require(scoreChange != 0, "Score change cannot be zero");
        require(scoreChange >= MIN_SCORE_CHANGE && scoreChange <= MAX_SCORE_CHANGE, "Score change out of bounds");
        require(bytes(eventType).length > 0, "Event type cannot be empty");
        require(proofHash != bytes32(0), "Proof hash cannot be empty");
        
        _reputationEventCounter.increment();
        uint256 eventId = _reputationEventCounter.current();
        
        // Create reputation event
        reputationEvents[eventId] = ReputationEvent({
            eventId: eventId,
            targetWallet: targetWallet,
            issuerWallet: msg.sender,
            scoreChange: scoreChange,
            eventType: eventType,
            description: description,
            timestamp: block.timestamp,
            proofHash: proofHash
        });
        
        // Update reputation data
        ReputationData storage reputation = reputationScores[targetWallet];
        uint256 oldTrustLevel = reputation.trustLevel;
        
        // Update scores
        if (scoreChange > 0) {
            reputation.positiveEvents++;
        } else {
            reputation.negativeEvents++;
        }
        
        reputation.totalScore = uint256(int256(reputation.totalScore) + scoreChange);
        reputation.lastUpdated = block.timestamp;
        reputation.isActive = true;
        
        // Update trust level
        uint256 newTrustLevel = calculateTrustLevel(reputation.totalScore);
        reputation.trustLevel = newTrustLevel;
        
        // Add event to wallet's event list
        walletEvents[targetWallet].push(eventId);
        
        emit ReputationEventIssued(
            eventId,
            targetWallet,
            msg.sender,
            scoreChange,
            eventType,
            reputation.totalScore,
            newTrustLevel
        );
        
        if (oldTrustLevel != newTrustLevel) {
            emit TrustLevelUpdated(targetWallet, oldTrustLevel, newTrustLevel, reputation.totalScore);
        }
    }
    
    /**
     * @dev Calculate trust level based on total score
     * @param totalScore Total reputation score
     * @return Trust level (1-5)
     */
    function calculateTrustLevel(uint256 totalScore) public pure returns (uint256) {
        if (totalScore >= TRUST_LEVEL_5_THRESHOLD) return 5;
        if (totalScore >= TRUST_LEVEL_4_THRESHOLD) return 4;
        if (totalScore >= TRUST_LEVEL_3_THRESHOLD) return 3;
        if (totalScore >= TRUST_LEVEL_2_THRESHOLD) return 2;
        return 1;
    }
    
    /**
     * @dev Get reputation data for a wallet
     * @param wallet Wallet address
     * @return totalScore Total reputation score
     * @return trustLevel Trust level (1-5)
     * @return lastUpdated Last update timestamp
     * @return positiveEvents Number of positive events
     * @return negativeEvents Number of negative events
     * @return isActive Active status
     */
    function getReputationData(address wallet) external view returns (
        uint256 totalScore,
        uint256 trustLevel,
        uint256 lastUpdated,
        uint256 positiveEvents,
        uint256 negativeEvents,
        bool isActive
    ) {
        ReputationData memory reputation = reputationScores[wallet];
        return (
            reputation.totalScore,
            reputation.trustLevel,
            reputation.lastUpdated,
            reputation.positiveEvents,
            reputation.negativeEvents,
            reputation.isActive
        );
    }
    
    /**
     * @dev Get reputation events for a wallet
     * @param wallet Wallet address
     * @return eventIds Array of event IDs
     */
    function getWalletEvents(address wallet) external view returns (uint256[] memory) {
        return walletEvents[wallet];
    }
    
    /**
     * @dev Get reputation event details
     * @param eventId Event ID
     * @return eventData Reputation event data
     */
    function getReputationEvent(uint256 eventId) external view returns (ReputationEvent memory) {
        return reputationEvents[eventId];
    }
    
    /**
     * @dev Get total number of reputation events
     * @return Total count
     */
    function getTotalReputationEvents() external view returns (uint256) {
        return _reputationEventCounter.current();
    }
    
    /**
     * @dev Check if a wallet has reputation data
     * @param wallet Wallet address
     * @return True if wallet has reputation data
     */
    function hasReputationData(address wallet) external view returns (bool) {
        return reputationScores[wallet].isActive;
    }
    
    /**
     * @dev Get reputation summary for multiple wallets
     * @param wallets Array of wallet addresses
     * @return scores Array of total scores
     * @return trustLevels Array of trust levels
     */
    function getBatchReputationData(address[] memory wallets) external view returns (
        uint256[] memory scores,
        uint256[] memory trustLevels
    ) {
        scores = new uint256[](wallets.length);
        trustLevels = new uint256[](wallets.length);
        
        for (uint256 i = 0; i < wallets.length; i++) {
            ReputationData memory reputation = reputationScores[wallets[i]];
            scores[i] = reputation.totalScore;
            trustLevels[i] = reputation.trustLevel;
        }
    }
}
