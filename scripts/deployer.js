const { ethers } = require('hardhat');

async function main() {
	// Get Deployer account
	const [deployer] = await ethers.getSigners();

	const ETHRegistrarControllerAddress = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'; // Mainnet
	
	// Deploying main Contract
	const Contract = await ethers.getContractFactory("BulkRegistrar");
	const contract = await Contract.deploy(ETHRegistrarControllerAddress);
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
