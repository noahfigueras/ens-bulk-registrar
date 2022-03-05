const { ethers } = require('hardhat');

async function main() {
	// Get Deployer account
	const [deployer] = await ethers.getSigners();

	// Deploying main Contract
	const Contract = await ethers.getContractFactory("BulkRegistrar");
	const contract = await Contract.deploy();
	await contract.deployed();

	console.log("Smart contract deployed with address:", contract.address);
	console.log("Contract deployed with address:", deployer.address);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
