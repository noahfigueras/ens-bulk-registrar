const { expect } = require("chai");

describe("Registering ens domains in bulk", function() {
  let Contract;
  let contract;
  let owner;

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

});
