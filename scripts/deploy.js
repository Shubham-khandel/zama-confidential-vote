const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);

  const Factory = await ethers.getContractFactory('ConfidentialVote');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  console.log('ConfidentialVote deployed at:', await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
