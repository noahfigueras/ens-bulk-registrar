import { ethers } from 'ethers';
import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

const Main = ({Provider}) => {
	let provider;
	let signer;

	if(Provider !== null) {
		provider = new ethers.providers.Web3Provider(Provider);
		signer = provider.getSigner();
	}
	
	const [input, setInput] = useState("");
	const [domains, addDomain] = useState([]);
	const [duration, setDuration] = useState(31536000);
	const [secret, setSecret] = useState(ethers.utils.formatBytes32String("supersecretpassword"));

	const contractAddress ='0xca8c8688914e0f7096c920146cd0ad85cd7ae8b9';
	const ABI = [
		"function available (string memory name) external view returns(bool)",
		"function rentPrice(string[] calldata names, uint duration) external view returns(uint total)",
		"function submitCommit(string[] calldata names, address owner, bytes32 secret) external",
		"function registerAll(string[] calldata names, address _owner, uint duration, bytes32 secret) external payable"
	];

	const addToBatch = async () => {
		try{
			const domain = input;
			const contract = _initContract(); 
			const available = await contract.available(domain);
			if(!available) {
				console.log("Domain is not available");
				return;
			} 
			addDomain(oldD => [...oldD, domain]);	
			
		} catch(err) {
			console.log(err);
		}		
	};

	const register = async () => {
		try{
			const contract = _initContract();	
			const addr = await signer.getAddress();
			console.log("beforeCommit");
			await contract.submitCommit(domains, addr, secret);
			console.log("Submitted waiting 65 sec ...");
			await _delay(65000); 
			await contract.registerAll(domains, addr, duration, secret, {value: ethers.utils.parseEther("1.0")}); 
			console.log("Done registering");
		} catch(err) {
			console.log(err);
		}
	}
	
	const _initContract = () => {
		if(Provider === null){
			throw 'Error: Provider is null, please connect to wallet.';
		}
		const contract = new ethers.Contract(contractAddress, ABI, signer);		
		return contract;
	}

	const _delay = ms => new Promise(res => setTimeout(res, ms));

	return (
		<div className="App-header">
			<InputGroup style={{padding: "20px", maxWidth: "600px"}} className="mb-3">
				<FormControl
					placeholder="yourdomain"
					aria-label="Opensea Url"
					aria-describedby="basic-addon2"
					value={input}
					onChange={e => setInput(e.target.value)}
				/>
				<Button onClick={addToBatch} variant="outline-secondary" id="button-addon2">
					Add domain
				</Button>
      		</InputGroup>
			<div id="domains-box">
				{domains.map((domain,id) => (
					<p key={id}>{id+1}. {domain}</p>	
				))}
			</div>
			<Button onClick={register} variant="primary">Register all</Button>
		</div>
	);
}

export default Main;
