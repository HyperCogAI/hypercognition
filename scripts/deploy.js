const hre = require("hardhat");

async function main() {
  console.log("Deploying HyperCognitionEscrow to Base mainnet...");

  // Base mainnet USDC address
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  // Platform treasury address - REPLACE WITH YOUR ACTUAL TREASURY WALLET
  const TREASURY_ADDRESS = process.env.PLATFORM_TREASURY_ADDRESS;

  if (!TREASURY_ADDRESS) {
    throw new Error("PLATFORM_TREASURY_ADDRESS not set in .env file");
  }

  console.log("USDC Address:", USDC_ADDRESS);
  console.log("Treasury Address:", TREASURY_ADDRESS);

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.005")) {
    throw new Error("Insufficient ETH balance. Need at least 0.005 ETH for deployment.");
  }

  // Deploy contract
  const HyperCognitionEscrow = await hre.ethers.getContractFactory("HyperCognitionEscrow");
  const escrow = await HyperCognitionEscrow.deploy(USDC_ADDRESS, TREASURY_ADDRESS);

  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("✅ HyperCognitionEscrow deployed to:", escrowAddress);

  // Wait for a few block confirmations before verification
  console.log("Waiting for block confirmations...");
  await escrow.deploymentTransaction().wait(5);

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Contract Address:", escrowAddress);
  console.log("USDC Address:", USDC_ADDRESS);
  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("Platform Fee:", "2.5%");
  console.log("\n🔍 Verify on BaseScan:");
  console.log(`npx hardhat verify --network base ${escrowAddress} "${USDC_ADDRESS}" "${TREASURY_ADDRESS}"`);
  console.log("\n📝 Add to .env:");
  console.log(`VITE_BASE_ESCROW_CONTRACT=${escrowAddress}`);
  console.log(`VITE_PLATFORM_TREASURY=${TREASURY_ADDRESS}`);
  console.log(`VITE_BASE_USDC_ADDRESS=${USDC_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
