const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
	if(hre.network.name != "hardhat") {
		console.log("Error: Please run only on hardhat network with fork");
		return 1;
	}
	
	// Signers
	const [owner, user] = await ethers.getSigners();

	// Getting mainnet controllet Abi	
	const ETHRegistrarControllerAddress = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'; // Mainnet
	const controllerAbi = [	
		"function available(string memory name) external view returns(bool)",
		"function register(string calldata name, address owner, uint duration, bytes32 secret) external payable",
		"function rentPrice(string memory name, uint duration) external view returns(uint)",
		"function makeCommitment(string memory name, address owner, bytes32 secret) external pure returns(bytes32)",
		"function commit(bytes32 commitment) external"
	];
	const mainnetContract = new ethers.Contract(ETHRegistrarControllerAddress, controllerAbi, owner);

	// Deploying main contract
	Contract = await ethers.getContractFactory("BulkRegistrar");
	contract = await Contract.deploy(ETHRegistrarControllerAddress);
	await contract.deployed();

	// Set constants
	const domains = ["noahfigueras", "batmansuper", "freaksworld", "lolomartinez"];
	const secret = ethers.utils.formatBytes32String("supersecretpassword");

	// Estimate gas for commit 
	const commit = await mainnetContract.makeCommitment("lamadredeltopo", owner.address, secret);	
	const one = await mainnetContract.estimateGas.commit(commit);
	const two = await contract.estimateGas.submitCommit(domains, owner.address, secret);
	console.log("Gas Estimate for commit with original contract:", one);
	console.log("Gas Estimate for 3 bulk commit with new contract:", two);

}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
});
