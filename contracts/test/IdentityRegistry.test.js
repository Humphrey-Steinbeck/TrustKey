const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityRegistry", function () {
  let identityRegistry;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await identityRegistry.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero identities", async function () {
      expect(await identityRegistry.getTotalIdentities()).to.equal(0);
    });
  });

  describe("Identity Registration", function () {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"));
    const metadataURI = "ipfs://QmTest123";

    it("Should allow user to register identity", async function () {
      await expect(identityRegistry.connect(user1).registerIdentity(credentialHash, metadataURI))
        .to.emit(identityRegistry, "IdentityRegistered")
        .withArgs(1, user1.address, credentialHash, await getBlockTimestamp());

      expect(await identityRegistry.getTotalIdentities()).to.equal(1);
      expect(await identityRegistry.hasActiveIdentity(user1.address)).to.be.true;
    });

    it("Should prevent duplicate identity registration", async function () {
      await identityRegistry.connect(user1).registerIdentity(credentialHash, metadataURI);
      
      await expect(
        identityRegistry.connect(user1).registerIdentity(credentialHash, metadataURI)
      ).to.be.revertedWith("Identity already exists");
    });

    it("Should prevent duplicate credential hash usage", async function () {
      await identityRegistry.connect(user1).registerIdentity(credentialHash, metadataURI);
      
      await expect(
        identityRegistry.connect(user2).registerIdentity(credentialHash, metadataURI)
      ).to.be.revertedWith("Credential hash already used");
    });

    it("Should reject zero credential hash", async function () {
      await expect(
        identityRegistry.connect(user1).registerIdentity(ethers.constants.HashZero, metadataURI)
      ).to.be.revertedWith("Invalid credential hash");
    });
  });

  describe("Identity Management", function () {
    const credentialHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-1"));
    const credentialHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-2"));
    const metadataURI1 = "ipfs://QmTest1";
    const metadataURI2 = "ipfs://QmTest2";

    beforeEach(async function () {
      await identityRegistry.connect(user1).registerIdentity(credentialHash1, metadataURI1);
    });

    it("Should allow identity update", async function () {
      await expect(identityRegistry.connect(user1).updateIdentity(credentialHash2, metadataURI2))
        .to.emit(identityRegistry, "IdentityUpdated")
        .withArgs(1, user1.address, credentialHash2, await getBlockTimestamp());

      const [id, hash, timestamp, isActive, uri] = await identityRegistry.getIdentityByWallet(user1.address);
      expect(hash).to.equal(credentialHash2);
      expect(uri).to.equal(metadataURI2);
    });

    it("Should prevent non-owner from updating identity", async function () {
      await expect(
        identityRegistry.connect(user2).updateIdentity(credentialHash2, metadataURI2)
      ).to.be.revertedWith("Identity not found");
    });

    it("Should allow identity deactivation", async function () {
      await expect(identityRegistry.connect(user1).deactivateIdentity())
        .to.emit(identityRegistry, "IdentityDeactivated")
        .withArgs(1, user1.address, await getBlockTimestamp());

      expect(await identityRegistry.hasActiveIdentity(user1.address)).to.be.false;
    });
  });

  describe("Identity Queries", function () {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"));
    const metadataURI = "ipfs://QmTest123";

    beforeEach(async function () {
      await identityRegistry.connect(user1).registerIdentity(credentialHash, metadataURI);
    });

    it("Should return correct identity by wallet", async function () {
      const [id, hash, timestamp, isActive, uri] = await identityRegistry.getIdentityByWallet(user1.address);
      
      expect(id).to.equal(1);
      expect(hash).to.equal(credentialHash);
      expect(isActive).to.be.true;
      expect(uri).to.equal(metadataURI);
    });

    it("Should return correct identity by hash", async function () {
      const [id, wallet, timestamp, isActive, uri] = await identityRegistry.getIdentityByHash(credentialHash);
      
      expect(id).to.equal(1);
      expect(wallet).to.equal(user1.address);
      expect(isActive).to.be.true;
      expect(uri).to.equal(metadataURI);
    });

    it("Should verify credential hash", async function () {
      expect(await identityRegistry.verifyCredentialHash(credentialHash)).to.be.true;
      expect(await identityRegistry.verifyCredentialHash(ethers.constants.HashZero)).to.be.false;
    });
  });

  describe("Multiple Identities", function () {
    it("Should handle multiple identity registrations", async function () {
      const hash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-1"));
      const hash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-2"));
      const hash3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("credential-3"));

      await identityRegistry.connect(user1).registerIdentity(hash1, "ipfs://Qm1");
      await identityRegistry.connect(user2).registerIdentity(hash2, "ipfs://Qm2");
      await identityRegistry.connect(user3).registerIdentity(hash3, "ipfs://Qm3");

      expect(await identityRegistry.getTotalIdentities()).to.equal(3);
      expect(await identityRegistry.hasActiveIdentity(user1.address)).to.be.true;
      expect(await identityRegistry.hasActiveIdentity(user2.address)).to.be.true;
      expect(await identityRegistry.hasActiveIdentity(user3.address)).to.be.true;
    });
  });
});

async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}
