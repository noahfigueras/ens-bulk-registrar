const { expect } = require("chai");

describe("Registering ens domains in bulk", function() {
	let Contract;
	let contract;
	let owner;
	const duration = 31536000; // 1year in seconds
	const delay = ms => new Promise(res => setTimeout(res, ms)); // Utility function
	const Ether = ethers.utils.parseEther("1.0");
	const ownerFee = ethers.utils.parseEther("0.01");
	const resolver = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"; // Mainnet

	beforeEach( async () => {
		Contract = await ethers.getContractFactory("BulkRegistrar");
		contract = await Contract.deploy();
		await contract.deployed();

		[owner, user] = await ethers.getSigners();
	});

	it("Returns domain availability", async function() {
		const noah = await contract.available("noah");
		const noahFigueras = await contract.available("noahfigueras");

		expect(noah).to.equal(false);
		expect(noahFigueras).to.equal(true);
	});

	it("Returns price of registerAll domains", async function() {
		const domains = ["noahfigueras", "lokoperez", "elzorroloko"];
		const rentPrice = await contract.rentPrice(domains, duration);
		const totalCost = ethers.utils.formatEther(rentPrice);	
	});

	it("Reverts array of domains when one it's not available", async function() {
		const domains = ["noahfigueras", "noah", "batmabnxoxo"];
		const secret = ethers.utils.formatBytes32String("lalalsdkfjalkjerklasdjklj");
		await contract.submitCommit(domains, owner.address, secret, resolver, owner.address);

		// Protocol has to wait to verify commit to prevent front run
		await delay(65000); 

		let revert = false;
		try{
			await contract.registerAll(domains, owner.address , duration, secret,resolver, owner.address, {value: Ether});
		} catch(err){
			revert = true; 
		}
		expect(revert).to.equal(true);
	});

	it("Registers domains in bulk", async function() {
		const domains = ["noahfigueras", "batmansuper", "freaksworld", "noahfigueroa0", "noahfigueroa1", "noahfigueroa"];
		const secret = ethers.utils.formatBytes32String("supersecretpassword");
		await contract.submitCommit(domains, owner.address, secret, resolver, owner.address);

		// Protocol has to wait to verify commit to prevent front run
		await delay(65000); 
		// Register bulk
		const estimate = await contract.estimateGas.registerAll(domains, owner.address, duration, secret, resolver, owner.address, {value: Ether});
		await contract.registerAll(domains, owner.address, duration, secret, resolver, owner.address, {value: Ether, gasLimit: estimate});
		// Check
		const noahFigueras = await contract.available("noahfigueras");	
		const freaksWorld = await contract.available("freaksworld");	
		const batmanSuper = await contract.available("batmansuper");	
		expect(noahFigueras).to.equal(false);
		expect(freaksWorld).to.equal(false);
		expect(batmanSuper).to.equal(false);
	});

	it("Transfers fee to owner of contract with flat fee option", async function() {
		const domains = ["lokoPerez", "batmansuper2", "freaksworld2"];
		const secret = ethers.utils.formatBytes32String("supersecretpassword");
		await contract.connect(user).submitCommit(domains, user.address, secret, resolver, owner.address);
		await contract.changeFeeStyle(true);

		// Protocol has to wait to verify commit to prevent front run
		await delay(65000); 
		// Register bulk
		const beforeBalance = await owner.getBalance();
		await contract.connect(user).registerAll(domains, user.address , duration, secret,resolver, owner.address, {value: Ether});
		const afterBalance = await owner.getBalance();
		
		const resultBalance = beforeBalance.add(ownerFee);
		expect(String(afterBalance)).to.equal(String(resultBalance));
	});

	it("Transfers fee to owner of contract with percentage fee option", async function() {
		const domains = ["lokoPerez10", "batmansuper20", "freaksworld20", "noahfigueras10"];
		const secret = ethers.utils.formatBytes32String("supersecretpassword");
		await contract.connect(user).submitCommit(domains, user.address, secret, resolver, owner.address);
		await contract.changeFeeStyle(false);

		// Protocol has to wait to verify commit to prevent front run
		await delay(65000); 
		// Register bulk
		const estimate_gas = await contract.connect(user).estimateGas.registerAll(domains, user.address , duration, secret, resolver, owner.address, {value: Ether});
		const beforeBalance = await owner.getBalance();
		const tx = await contract.connect(user).registerAll(domains, user.address , duration, secret, resolver, owner.address, {value: Ether, gasLimit: estimate_gas.add("10000")});
		const afterBalance = await owner.getBalance();

		const gasFees = estimate_gas.mul(tx.gasPrice);
		const perc = await contract.perc_gasFee();
		const returned = gasFees.mul(perc).div(ethers.BigNumber.from('100'));
		const diff = afterBalance.sub(beforeBalance);

		// check if result has a margin of max 70000 gwei (down to 18 cents difference at the time) 
		let revert = false;
		const max = ethers.utils.parseUnits("70000.0", "gwei");
		if(returned.sub(diff) > max) {
			revert = true;
		}
		expect(revert).to.equal(false);
	});


	it("Reverts when not owner tries to change FEE param", async function() {
		let revert = false;
		try{
			await contract.connect(user).chageFee(Ether);
		} catch(err){
			revert = true;
		}
		expect(revert).to.equal(true);
	});

	it("Enables owner to change FEE param", async function() {
		await contract.changeFee(Ether);
		expect(await contract.FEE()).to.equal(Ether);
	});

	it("Enables owner to change percentage_Fee param", async function() {
		await contract.setPercentageGas(10);
		expect(await contract.perc_gasFee()).to.equal(10);
	});
});
