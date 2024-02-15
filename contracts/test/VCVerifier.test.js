const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VCVerifier", function () {
  let vcVerifier;
  let identityRegistry;
  let owner;
  let user1;
  let user2;
  let authorizedVerifier;

  beforeEach(async function () {
    [owner, user1, user2, authorizedVerifier] = await ethers.getSigners();
    
    // Deploy IdentityRegistry first
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.deployed();
    
    // Deploy VCVerifier with IdentityRegistry address
    const VCVerifier = await ethers.getContractFactory("VCVerifier");
    vcVerifier = await VCVerifier.deploy(identityRegistry.address);
    await vcVerifier.deployed();
    
    // Register identity for testing
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"));
    await identityRegistry.connect(user1).registerIdentity(credentialHash, "ipfs://QmTest");
    
    // Add authorized verifier
    await vcVerifier.addAuthorizedVerifier(authorizedVerifier.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await vcVerifier.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero verification requests", async function () {
      expect(await vcVerifier.getTotalVerificationRequests()).to.equal(0);
    });

    it("Should have owner as authorized verifier", async function () {
      expect(await vcVerifier.authorizedVerifiers(owner.address)).to.be.true;
    });
  });

  describe("Authorized Verifier Management", function () {
    it("Should allow owner to add authorized verifier", async function () {
      await expect(vcVerifier.addAuthorizedVerifier(user1.address))
        .to.emit(vcVerifier, "AuthorizedVerifierAdded")
        .withArgs(user1.address);
      
      expect(await vcVerifier.authorizedVerifiers(user1.address)).to.be.true;
    });

    it("Should allow owner to remove authorized verifier", async function () {
      await vcVerifier.addAuthorizedVerifier(user1.address);
      
      await expect(vcVerifier.removeAuthorizedVerifier(user1.address))
        .to.emit(vcVerifier, "AuthorizedVerifierRemoved")
        .withArgs(user1.address);
      
      expect(await vcVerifier.authorizedVerifiers(user1.address)).to.be.false;
    });

    it("Should prevent non-owner from adding authorized verifier", async function () {
      await expect(
        vcVerifier.connect(user1).addAuthorizedVerifier(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Trusted Issuer Management", function () {
    it("Should allow owner to add trusted issuer", async function () {
      await expect(vcVerifier.addTrustedIssuer(user1.address))
        .to.emit(vcVerifier, "TrustedIssuerAdded")
        .withArgs(user1.address);
      
      expect(await vcVerifier.trustedIssuers(user1.address)).to.be.true;
    });

    it("Should allow owner to remove trusted issuer", async function () {
      await vcVerifier.addTrustedIssuer(user1.address);
      
      await expect(vcVerifier.removeTrustedIssuer(user1.address))
        .to.emit(vcVerifier, "TrustedIssuerRemoved")
        .withArgs(user1.address);
      
      expect(await vcVerifier.trustedIssuers(user1.address)).to.be.false;
    });
  });

  describe("Verification Type Configuration", function () {
    it("Should allow owner to configure verification types", async function () {
      const requirements = ["age", "dateOfBirth"];
      
      await expect(vcVerifier.configureVerificationType("age_verification", requirements))
        .to.emit(vcVerifier, "VerificationTypeConfigured")
        .withArgs("age_verification", requirements);
      
      const retrievedRequirements = await vcVerifier.getVerificationTypeRequirements("age_verification");
      expect(retrievedRequirements.length).to.equal(2);
      expect(retrievedRequirements[0]).to.equal("age");
      expect(retrievedRequirements[1]).to.equal("dateOfBirth");
    });
  });

  describe("Verification Request", function () {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"));
    const proof = [1, 2, 3, 4, 5, 6, 7, 8];
    const publicSignals = [1, 2];

    it("Should allow registered identity to request verification", async function () {
      await expect(
        vcVerifier.connect(user1).requestVerification(
          credentialHash,
          "identity_verification",
          proof,
          publicSignals
        )
      ).to.emit(vcVerifier, "VerificationRequested");

      const totalRequests = await vcVerifier.getTotalVerificationRequests();
      expect(totalRequests).to.equal(1);
    });

    it("Should prevent unregistered identity from requesting verification", async function () {
      const unregisteredUser = ethers.Wallet.createRandom();
      
      await expect(
        vcVerifier.connect(unregisteredUser).requestVerification(
          credentialHash,
          "identity_verification",
          proof,
          publicSignals
        )
      ).to.be.revertedWith("Identity not registered or inactive");
    });

    it("Should prevent verification request for non-existent credential", async function () {
      const nonExistentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("non-existent"));
      
      await expect(
        vcVerifier.connect(user1).requestVerification(
          nonExistentHash,
          "identity_verification",
          proof,
          publicSignals
        )
      ).to.be.revertedWith("Credential hash not found or inactive");
    });

    it("Should reject empty verification type", async function () {
      await expect(
        vcVerifier.connect(user1).requestVerification(
          credentialHash,
          "",
          proof,
          publicSignals
        )
      ).to.be.revertedWith("Verification type cannot be empty");
    });
  });

  describe("Verification Completion", function () {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"));
    const proof = [1, 2, 3, 4, 5, 6, 7, 8];
    const publicSignals = [1, 2];
    const verificationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("verification-result"));

    beforeEach(async function () {
      await vcVerifier.connect(user1).requestVerification(
        credentialHash,
        "identity_verification",
        proof,
        publicSignals
      );
    });

    it("Should allow authorized verifier to complete verification", async function () {
      await expect(
        vcVerifier.connect(authorizedVerifier).completeVerification(
          1,
          true,
          verificationHash
        )
      ).to.emit(vcVerifier, "VerificationCompleted");

      const request = await vcVerifier.getVerificationRequest(1);
      expect(request.isVerified).to.be.true;
      expect(request.verificationHash).to.equal(verificationHash);
    });

    it("Should prevent unauthorized verifier from completing verification", async function () {
      await expect(
        vcVerifier.connect(user1).completeVerification(
          1,
          true,
          verificationHash
        )
      ).to.be.revertedWith("Not authorized verifier");
    });

    it("Should prevent completing non-existent request", async function () {
      await expect(
        vcVerifier.connect(authorizedVerifier).completeVerification(
          999,
          true,
          verificationHash
        )
      ).to.be.revertedWith("Request not found");
    });

    it("Should prevent completing already processed request", async function () {
      await vcVerifier.connect(authorizedVerifier).completeVerification(
        1,
        true,
        verificationHash
      );

      await expect(
        vcVerifier.connect(authorizedVerifier).completeVerification(
          1,
          false,
          verificationHash
        )
      ).to.be.revertedWith("Request already processed");
    });

    it("Should update credential verification status on successful verification", async function () {
      await vcVerifier.connect(authorizedVerifier).completeVerification(
        1,
        true,
        verificationHash
      );

      const [isVerified, verificationCount] = await vcVerifier.getCredentialVerificationStatus(credentialHash);
      expect(isVerified).to.be.true;
      expect(verificationCount).to.equal(1);
    });
  });

  describe("Proof Verification", function () {
    it("Should verify valid proof", async function () {
      const validProof = [1, 2, 3, 4, 5, 6, 7, 8];
      const validSignals = [1, 2];
      
      const isValid = await vcVerifier.verifyProof(validProof, validSignals);
      expect(isValid).to.be.true;
    });

    it("Should reject proof with zero components", async function () {
      const invalidProof = [0, 0, 0, 0, 0, 0, 0, 0];
      const validSignals = [1, 2];
      
      const isValid = await vcVerifier.verifyProof(invalidProof, validSignals);
      expect(isValid).to.be.false;
    });

    it("Should reject proof with zero public signals", async function () {
      const validProof = [1, 2, 3, 4, 5, 6, 7, 8];
      const invalidSignals = [0, 0];
      
      const isValid = await vcVerifier.verifyProof(validProof, invalidSignals);
      expect(isValid).to.be.false;
    });
  });

  describe("Credential Verification Status", function () {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"));

    it("Should return false for non-verified credential", async function () {
      const isVerified = await vcVerifier.isCredentialVerified(credentialHash);
      expect(isVerified).to.be.false;
    });

    it("Should return true for verified credential", async function () {
      const proof = [1, 2, 3, 4, 5, 6, 7, 8];
      const publicSignals = [1, 2];
      const verificationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("verification-result"));

      await vcVerifier.connect(user1).requestVerification(
        credentialHash,
        "identity_verification",
        proof,
        publicSignals
      );

      await vcVerifier.connect(authorizedVerifier).completeVerification(
        1,
        true,
        verificationHash
      );

      const isVerified = await vcVerifier.isCredentialVerified(credentialHash);
      expect(isVerified).to.be.true;
    });
  });

  describe("Batch Verification", function () {
    const credentialHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-1"));
    const credentialHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-2"));
    const credentialHash3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-3"));

    beforeEach(async function () {
      // Register additional identities
      await identityRegistry.connect(user2).registerIdentity(credentialHash2, "ipfs://Qm2");
      
      // Verify first credential
      const proof = [1, 2, 3, 4, 5, 6, 7, 8];
      const publicSignals = [1, 2];
      const verificationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("verification-result"));

      await vcVerifier.connect(user1).requestVerification(
        credentialHash1,
        "identity_verification",
        proof,
        publicSignals
      );

      await vcVerifier.connect(authorizedVerifier).completeVerification(
        1,
        true,
        verificationHash
      );
    });

    it("Should return batch verification status", async function () {
      const credentialHashes = [credentialHash1, credentialHash2, credentialHash3];
      const verificationStatuses = await vcVerifier.batchVerifyCredentials(credentialHashes);
      
      expect(verificationStatuses[0]).to.be.true;  // Verified
      expect(verificationStatuses[1]).to.be.false; // Not verified
      expect(verificationStatuses[2]).to.be.false; // Not verified
    });
  });
});
