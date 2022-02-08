const hre = require("hardhat");
const ethers = hre.ethers;

async function main(args) {
	if(hre.network.name != "hardhat") {
		console.log("Error: Please run only on hardhat network with fork");
		return 1;
	}

	// Utilities
	const delay = ms => new Promise(res => setTimeout(res, ms));
	
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
	const deployed = await contract.deployTransaction.wait();
	console.log("Gas Estimation for deployment of contract:", Number(deployed.gasUsed));

	// Set constants
	let total;
	let saved;
	const Ether = ethers.utils.parseEther("1.0");
	const number = 4;
	const duration = 31536000; // 1year in seconds
	const domains = generateDomains(number);
	const secret = ethers.utils.formatBytes32String("supersecretpassword");

	// Estimate gas for commit 
	const commit = await mainnetContract.makeCommitment('noahfiguerasmartinez', owner.address, secret);	
	const one = await mainnetContract.estimateGas.commit(commit);
	const two = await contract.estimateGas.submitCommit(domains, owner.address, secret);
	total = Number(one) * number;
	saved = Number(two);
	console.log("Gas Estimate for every single commit with original contract:", Number(one));
	console.log(`Gas Estimate for ${number} bulk commit with new contract:`, Number(two));

	// Commit realistically for registering to work
	await mainnetContract.commit(commit);
	await contract.submitCommit(domains, owner.address, secret);
	
	// Wait some time for ens front-run prevention mechanism
	await delay(65000);

	// Estimage gas for registering domains
	const first = await mainnetContract.estimateGas.register("noahfiguerasmartinez", owner.address, duration, secret, {value: Ether});
	const second = await contract.estimateGas.registerAll(domains, owner.address, duration, secret, {value: Ether});
	total = total + (Number(first) * number); 
	saved = saved + Number(second);
	console.log("Gas Estimate for every single register with original contract:", Number(first));
	console.log(`Gas Estimate for registering ${number} domains on bulk with new contract:`, Number(second));

	// Calculate Percentages
	const perc = calcPercentage(total, saved);		
	console.log("Percentage of gas saved is:", Number(perc), "%");
}

function generateDomains(num) {
	const name = 'noahfigueras';
	const arr = [];
	for(let i = 0; i < num; i++) {
		let n = name + String(i);
		arr.push(n);
	}
	return arr;
}

function calcPercentage(total, saved) {
	const savings = total - saved;
	return (savings / total) * 100;
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
});
