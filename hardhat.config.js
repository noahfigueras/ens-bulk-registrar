require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("etherscan", "Verifies code on etherscan")
    .addParam("address", "The address of the deployed contract")
    .setAction(
        async (taskArgs, hre) => {
            await hre.run("verify:verify", {
				address: taskArgs.address,
				constructorArguments: [
					'0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'
				],
            });
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
//Hardhat Config
module.exports = {
   solidity: "0.8.4",
     networks: {
         hardhat: {
            forking : {
                url: process.env.ALCHEMY_URL_MAINNET,
            }
        },
		 mainnet: {
			url: process.env.ALCHEMY_URL_MAINNET,
			accounts: [process.env.PRIVATE_KEY_1]
		 },
		 ropsten: {
			url: process.env.ALCHEMY_URL_ROPSTEN,
			accounts: [process.env.PRIVATE_KEY_1]
		 }
     },
     etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: process.env.ETHERSCAN_API
     },
     mocha: {
        timeout: 500000
     }
};
