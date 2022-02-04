const { expect } = require("chai");

describe("Registering ens domains in bulk", function() {
  let Contract;
  let contract;
  let owner;
	const duration = 31536000; // 1year in seconds
  const delay = ms => new Promise(res => setTimeout(res, ms)); // Utility function

  beforeEach( async () => {
		const ETHRegistrarControllerAddress = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'; // Mainnet
    Contract = await ethers.getContractFactory("BulkRegistrar");
    contract = await Contract.deploy(ETHRegistrarControllerAddress);
    await contract.deployed();

    [owner] = await ethers.getSigners();
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
		const secret = ethers.utils.formatBytes32String("lala123lsdkfjalkjerklasdjklj");
		await contract.submitCommit(domains, owner.address, secret);
	
		// Protocol has to wait to verify commit to prevent front run
		await delay(65000); 

    let revert = false;
    try{
		  await contract.registerAll(domains, owner.address , duration, secret, {value: ethers.utils.parseEther("1.0")});
    } catch(err){
     revert = true; 
    }
    expect(revert).to.equal(true);
	});

  it("Registers domains in bulk", async function() {
		const domains = ["noahfigueras", "batmansuper", "freaksworld"];
		const secret = ethers.utils.formatBytes32String("lalalsdkfjalkjerklasdjklj");
		await contract.submitCommit(domains, owner.address, secret);
	
		// Protocol has to wait to verify commit to prevent front run
		await delay(65000); 
    // Register bulk
		await contract.registerAll(domains, owner.address , duration, secret, {value: ethers.utils.parseEther("1.0")});
    // Check
	  const noahFigueras = await contract.available("noahfigueras");	
	  const freaksWorld = await contract.available("freaksworld");	
	  const batmanSuper = await contract.available("batmansuper");	
    expect(noahFigueras).to.equal(false);
    expect(freaksWorld).to.equal(false);
    expect(batmanSuper).to.equal(false);
	});
});
