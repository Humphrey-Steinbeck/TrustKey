const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationScore", function () {
  let reputationScore;
  let identityRegistry;
  let owner;
  let user1;
  let user2;
  let user3;
  let authorizedIssuer;

  beforeEach(async function () {
    [owner, user1, user2, user3, authorizedIssuer] = await ethers.getSigners();
    
    // Deploy IdentityRegistry first
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.deployed();
    
    // Deploy ReputationScore with IdentityRegistry address
    const ReputationScore = await ethers.getContractFactory("ReputationScore");
    reputationScore = await ReputationScore.deploy(identityRegistry.address);
    await reputationScore.deployed();
    
    // Register identities for testing
    const credentialHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-1"));
    const credentialHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-2"));
    const credentialHash3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-3"));
    
    await identityRegistry.connect(user1).registerIdentity(credentialHash1, "ipfs://Qm1");
    await identityRegistry.connect(user2).registerIdentity(credentialHash2, "ipfs://Qm2");
    await identityRegistry.connect(user3).registerIdentity(credentialHash3, "ipfs://Qm3");
    
    // Add authorized issuer
    await reputationScore.addAuthorizedIssuer(authorizedIssuer.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await reputationScore.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero reputation events", async function () {
      expect(await reputationScore.getTotalReputationEvents()).to.equal(0);
    });

    it("Should have owner as authorized issuer", async function () {
      expect(await reputationScore.authorizedIssuers(owner.address)).to.be.true;
    });
  });

  describe("Authorized Issuer Management", function () {
    it("Should allow owner to add authorized issuer", async function () {
      await expect(reputationScore.addAuthorizedIssuer(user1.address))
        .to.emit(reputationScore, "AuthorizedIssuerAdded")
        .withArgs(user1.address);
      
      expect(await reputationScore.authorizedIssuers(user1.address)).to.be.true;
    });

    it("Should allow owner to remove authorized issuer", async function () {
      await reputationScore.addAuthorizedIssuer(user1.address);
      
      await expect(reputationScore.removeAuthorizedIssuer(user1.address))
        .to.emit(reputationScore, "AuthorizedIssuerRemoved")
        .withArgs(user1.address);
      
      expect(await reputationScore.authorizedIssuers(user1.address)).to.be.false;
    });

    it("Should prevent non-owner from adding authorized issuer", async function () {
      await expect(
        reputationScore.connect(user1).addAuthorizedIssuer(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Reputation Event Issuance", function () {
    const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"));

    it("Should allow authorized issuer to issue reputation event", async function () {
      await expect(
        reputationScore.connect(authorizedIssuer).issueReputationEvent(
          user1.address,
          25,
          "verification_completed",
          "Successfully verified identity",
          proofHash
        )
      ).to.emit(reputationScore, "ReputationEventIssued");

      const reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.totalScore).to.equal(25);
      expect(reputationData.trustLevel).to.equal(1);
      expect(reputationData.positiveEvents).to.equal(1);
      expect(reputationData.negativeEvents).to.equal(0);
    });

    it("Should prevent unauthorized issuer from issuing events", async function () {
      await expect(
        reputationScore.connect(user1).issueReputationEvent(
          user2.address,
          25,
          "verification_completed",
          "Test event",
          proofHash
        )
      ).to.be.revertedWith("Not authorized issuer");
    });

    it("Should prevent issuing events for unregistered identities", async function () {
      const unregisteredUser = ethers.Wallet.createRandom();
      
      await expect(
        reputationScore.connect(authorizedIssuer).issueReputationEvent(
          unregisteredUser.address,
          25,
          "verification_completed",
          "Test event",
          proofHash
        )
      ).to.be.revertedWith("Identity not registered or inactive");
    });

    it("Should handle negative reputation events", async function () {
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        25,
        "verification_completed",
        "Positive event",
        proofHash
      );

      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        -10,
        "verification_failed",
        "Negative event",
        proofHash
      );

      const reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.totalScore).to.equal(15);
      expect(reputationData.positiveEvents).to.equal(1);
      expect(reputationData.negativeEvents).to.equal(1);
    });

    it("Should enforce score change limits", async function () {
      await expect(
        reputationScore.connect(authorizedIssuer).issueReputationEvent(
          user1.address,
          100, // Exceeds max limit
          "verification_completed",
          "Test event",
          proofHash
        )
      ).to.be.revertedWith("Score change out of bounds");

      await expect(
        reputationScore.connect(authorizedIssuer).issueReputationEvent(
          user1.address,
          -100, // Exceeds min limit
          "verification_failed",
          "Test event",
          proofHash
        )
      ).to.be.revertedWith("Score change out of bounds");
    });
  });

  describe("Trust Level Calculation", function () {
    const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"));

    it("Should calculate correct trust levels", async function () {
      // Test trust level 1 (0-99 points)
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        50,
        "verification_completed",
        "Test event",
        proofHash
      );
      let reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.trustLevel).to.equal(1);

      // Test trust level 2 (100-299 points)
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        50,
        "verification_completed",
        "Test event",
        proofHash
      );
      reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.trustLevel).to.equal(2);

      // Test trust level 3 (300-599 points)
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        200,
        "verification_completed",
        "Test event",
        proofHash
      );
      reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.trustLevel).to.equal(3);

      // Test trust level 4 (600-999 points)
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        300,
        "verification_completed",
        "Test event",
        proofHash
      );
      reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.trustLevel).to.equal(4);

      // Test trust level 5 (1000+ points)
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        400,
        "verification_completed",
        "Test event",
        proofHash
      );
      reputationData = await reputationScore.getReputationData(user1.address);
      expect(reputationData.trustLevel).to.equal(5);
    });
  });

  describe("Reputation Data Queries", function () {
    const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"));

    beforeEach(async function () {
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        25,
        "verification_completed",
        "Test event",
        proofHash
      );
    });

    it("Should return correct reputation data", async function () {
      const reputationData = await reputationScore.getReputationData(user1.address);
      
      expect(reputationData.totalScore).to.equal(25);
      expect(reputationData.trustLevel).to.equal(1);
      expect(reputationData.positiveEvents).to.equal(1);
      expect(reputationData.negativeEvents).to.equal(0);
      expect(reputationData.isActive).to.be.true;
    });

    it("Should return empty data for non-existent reputation", async function () {
      const unregisteredUser = ethers.Wallet.createRandom();
      const reputationData = await reputationScore.getReputationData(unregisteredUser.address);
      
      expect(reputationData.totalScore).to.equal(0);
      expect(reputationData.trustLevel).to.equal(0);
      expect(reputationData.isActive).to.be.false;
    });

    it("Should return wallet events", async function () {
      const events = await reputationScore.getWalletEvents(user1.address);
      expect(events.length).to.equal(1);
    });

    it("Should return reputation event details", async function () {
      const events = await reputationScore.getWalletEvents(user1.address);
      const eventId = events[0];
      const event = await reputationScore.getReputationEvent(eventId);
      
      expect(event.targetWallet).to.equal(user1.address);
      expect(event.scoreChange).to.equal(25);
      expect(event.eventType).to.equal("verification_completed");
    });
  });

  describe("Batch Operations", function () {
    const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"));

    beforeEach(async function () {
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user1.address,
        25,
        "verification_completed",
        "Test event 1",
        proofHash
      );
      
      await reputationScore.connect(authorizedIssuer).issueReputationEvent(
        user2.address,
        50,
        "verification_completed",
        "Test event 2",
        proofHash
      );
    });

    it("Should return batch reputation data", async function () {
      const addresses = [user1.address, user2.address, user3.address];
      const [scores, trustLevels] = await reputationScore.getBatchReputationData(addresses);
      
      expect(scores[0]).to.equal(25);
      expect(scores[1]).to.equal(50);
      expect(scores[2]).to.equal(0);
      
      expect(trustLevels[0]).to.equal(1);
      expect(trustLevels[1]).to.equal(1);
      expect(trustLevels[2]).to.equal(0);
    });
  });
});
