# ens-bulk-registrar 

## Installation Guide
Clone this repository: `https://github.com/noahfigueras/ens-bulk-registrar.git`  
Install dependencies with `npm install`.  

Add Network keys and Private keys in a file called `.env` to execute scripts (there is a sample file called `env` just rename it to `.env` and add info).  
You can get your own network keys through [alchemy](https://www.alchemy.com/). and private key through your metamask account.  

## Modify smart Contract with desired fee. 
There's a fee that's paid to the owner when a user tries to register domains. The
default value is 0.01 ether but you can change that variable on the smart contract before
deployment.    
Contract located in `contracts/BulkRegistrar.sol`.    
 
## Gas estimation script
There is a script that estimates the gas of deployment of contract as well as the 
calculated savings on gas with registering domains in bulk.  
This script is executed on mainnet fork so all the results should be the same as mainnet.  
Execute script with `npx hardhat run scripts/gasEstimation.js`.  

## Tests 
Run tests to make sure everything gets executed as desired.  
Execute tests with `npx hardhat test`.

## Deployment
You can deploy the smart contract with: `npx hardhat run scripts/deployer.js --network DESIRED NETWORK`.  
This contracts interacts with a smart contract from ens already deployed on mainnet that is specified 
as a constructor on the deployment of the contract: `0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5`    
  
The next command will deploy contract on real mainnet:  
`Ex: npx hardhat run scripts/deploy.js --network mainnet`  

## Verify in Etherscan
Once the contract is deployed there's a script to verify contract on etherscan.  
1. Get a etherscan private api key in [etherscan.io](https://etherscan.io/).  
2. Add etherscan api key to the `.env` file as `ETHERSCAN_API= your_api`.   
3. Execute script `npx hardhat etherscan --address ADDRESS_OF_DEPLOYED_CONTRACT --network NETWORK`.    
Sometimes etherscan will not verify contract if there is not enough transaction.  
 
## Website Front-end
### Mainnet Fork setup
In order to test the website we need to start first our own mainnet fork network to test that out. If 
you already deployed contract to mainnet that would not be necessary.  
1. Start a mainnet fork with hardhat with `npx hardhat node`, leave this terminal open at all times.  
2. Copy one of the private keys of the accounts shown in the output and import that one to metamask and change to that account.
3. Add this hardhat network to metamask so we can interact with our website as shown here: [tutorial](https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node)
4. Open another terminal to deploy the smart contract on the existing mainnet fork we created with 
`npx hardhat run --network localhost ./scripts/deployer.js`.
5. Copy the address of the deployed contract which should be outputed by the previous script.  
6. Paste that address in the react app in the following file `/client/src/components/Main.js` substitute
the varibale `const contractAddress ='YOUR_CONTRACT_ADDRESS'` with your address. 

### Ract App launch
1. In order to launch the website change to the `client/` folder.
2. Run `npm install` inside `client` folder.
4. Finnally to run website on localhost execute `npm run start`. 
