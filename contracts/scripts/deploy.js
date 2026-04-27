const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting PharmaChainRegistry deployment...");

  const PharmaChain = await hre.ethers.getContractFactory("PharmaChainRegistry");
  const contract = await PharmaChain.deploy();

  await contract.deployed();

  const address = contract.address;
  console.log(`✅ PharmaChainRegistry deployed to: ${address}`);

  // Auto-update Backend .env
  const envPath = path.join(__dirname, "../../backend/.env");
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = /^CONTRACT_ADDRESS=.*$/m;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `CONTRACT_ADDRESS=${address}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${address}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("📝 Updated backend/.env with new CONTRACT_ADDRESS");
  } else {
    console.warn("⚠️ backend/.env not found. Skipping auto-update.");
    fs.writeFileSync(path.join(__dirname, "../deployed_address.txt"), address);
  }

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`Contract: PharmaChainRegistry`);
  console.log(`Address:  ${address}`);
  console.log(`Network:  ${hre.network.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
