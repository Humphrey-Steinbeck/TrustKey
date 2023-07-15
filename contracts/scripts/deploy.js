const { ethers } = require("hardhat");

async function main() {
  console.log("Starting TrustKey contracts deployment...");
  
  // Get the contract factories
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const ReputationScore = await ethers.getContractFactory("ReputationScore");
  const VCVerifier = await ethers.getContractFactory("VCVerifier");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy IdentityRegistry first
  console.log("\nDeploying IdentityRegistry...");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.deployed();
  console.log("IdentityRegistry deployed to:", identityRegistry.address);
  
  // Deploy ReputationScore with IdentityRegistry address
  console.log("\nDeploying ReputationScore...");
  const reputationScore = await ReputationScore.deploy(identityRegistry.address);
  await reputationScore.deployed();
  console.log("ReputationScore deployed to:", reputationScore.address);
  
  // Deploy VCVerifier with IdentityRegistry address
  console.log("\nDeploying VCVerifier...");
  const vcVerifier = await VCVerifier.deploy(identityRegistry.address);
  await vcVerifier.deployed();
  console.log("VCVerifier deployed to:", vcVerifier.address);
  
  // Verify deployments
  console.log("\nVerifying deployments...");
  
  const identityRegistryOwner = await identityRegistry.owner();
  const reputationScoreOwner = await reputationScore.owner();
  const vcVerifierOwner = await vcVerifier.owner();
  
  console.log("IdentityRegistry owner:", identityRegistryOwner);
  console.log("ReputationScore owner:", reputationScoreOwner);
  console.log("VCVerifier owner:", vcVerifierOwner);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      IdentityRegistry: identityRegistry.address,
      ReputationScore: reputationScore.address,
      VCVerifier: vcVerifier.address
    },
    timestamp: new Date().toISOString()
  };
  
  console.log("\nDeployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Optional: Verify contracts on Etherscan (if not on local network)
  if (deploymentInfo.network.name !== "hardhat" && deploymentInfo.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");
    await identityRegistry.deployTransaction.wait(6);
    await reputationScore.deployTransaction.wait(6);
    await vcVerifier.deployTransaction.wait(6);
    
    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: identityRegistry.address,
        constructorArguments: []
      });
    } catch (error) {
      console.log("IdentityRegistry verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: reputationScore.address,
        constructorArguments: [identityRegistry.address]
      });
    } catch (error) {
      console.log("ReputationScore verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: vcVerifier.address,
        constructorArguments: [identityRegistry.address]
      });
    } catch (error) {
      console.log("VCVerifier verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
