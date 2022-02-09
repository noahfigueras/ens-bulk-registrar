import './components.css';
import MyModal from './Modal';
import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const Main = ({Provider}) => {
	let provider;
	let signer;

	if(Provider !== null) {
		provider = new ethers.providers.Web3Provider(Provider);
		signer = provider.getSigner();
	}
	
	const [modalShow, setModalShow] = useState(false);
	const [input, setInput] = useState("");
	const [domains, setDomains] = useState([]);
	const [duration, setDuration] = useState(1);
	const [rent, setRent] = useState("0.0");
	const [phase, setPhase] = useState(0);
	const [pass, setPass] = useState("");

	const contractAddress ='0xca8c8688914e0f7096c920146cd0ad85cd7ae8b9';
	const ABI = [
		"function available (string memory name) external view returns(bool)",
		"function rentPrice(string[] calldata names, uint duration) external view returns(uint total)",
		"function submitCommit(string[] calldata names, address owner, bytes32 secret) external",
		"function registerAll(string[] calldata names, address _owner, uint duration, bytes32 secret) external payable"
	];

	const addToBatch = async () => {
		if(phase === 1){
			return;
		}
		try{
			const domain = input;
			const contract = _initContract(); 
			const available = await contract.available(domain);
			if(!available) {
				console.log("Domain is not available");
				return;
			} 
			setDomains(oldD => [...oldD, domain]);	
			setInput("");
		} catch(err) {
			console.log(err);
		}		
	};
	
	const deleteFromBatch = (e) => {
		if(phase === 1){
			return;
		}	
		const name = e.target.name;
		setDomains(domains.filter((item) => item !== name));
	}

	const request = async (_secret) => {
		// Close modal
		setModalShow(false);
		try{
			const contract = _initContract();	
			const addr = await signer.getAddress();
			const secret = ethers.utils.formatBytes32String(_secret);
			await contract.submitCommit(domains, addr, secret);
			setPhase(1);
			await _delay(65000); 
			setPass(secret);
			setPhase(2);
		} catch(err) {
			console.log(err);
		}
	}

	const register = async () => {
		try{
			const contract = _initContract();	
			const addr = await signer.getAddress();
			const _duration = _getDuration(); 
			await contract.registerAll(domains, addr, _duration, pass, {value: ethers.utils.parseEther("1.0")}); 
			console.log("Done registering");
		} catch(err) {
			console.log(err);
		}
	}
	
	const calculateRent = async () => {
		try{
			const contract = _initContract();
			const _duration = _getDuration(); 
			const _rent = await contract.rentPrice(domains, _duration); 
			const rentFmt = ethers.utils.formatEther(_rent);
			setRent(rentFmt.slice(0,6));	
		} catch(err) {
			console.log(err);
		}
	}

	const _getDuration = () => {
		return duration * 31536000
	}

	const _initContract = () => {
		if(Provider === null){
			throw 'Error: Provider is null, please connect to wallet.';
		}
		const contract = new ethers.Contract(contractAddress, ABI, signer);		
		return contract;
	}

	const _delay = ms => new Promise(res => setTimeout(res, ms));
	
	const increaseYear = () => {
		setDuration(duration + 1);
	}

	const decreaseYear = () => {
		if(duration === 1) {
			return;
		}
		setDuration(duration - 1);
	}

	useEffect(() => {
		calculateRent();	
	}, [duration, domains]);

	return (
	<div className="App-header">
		<h2>Save Gas registering your domains in bulk</h2>
		<div id="container-input">
			<InputGroup className="mb-3">
				<FormControl
				placeholder="yourdomain"
				aria-label="add-domain"
				aria-describedby="basic-addon2"
				value={input}
				onChange={e => setInput(e.target.value)}
				/>
				<Button onClick={addToBatch} variant="outline-secondary" id="button-addon2">
				Add domain
				</Button>
			</InputGroup>
			
			<div id="secondary-input">
				<InputGroup className="mb-3" style={{ maxWidth: "140px"}} >
					<Button onClick={decreaseYear} variant="outline-secondary">-</Button>
					<FormControl value={duration + " year"} />
					<Button onClick={increaseYear} variant="outline-secondary">+</Button>
				</InputGroup>
				<p>{rent} ETH Registration</p>
			</div>
		</div>

		<div id="domains-box">
		{domains.map((domain,id) => (
			<div key={id} className="single-domain">
				<p><span>{id+1}.</span> {domain}</p>	
				<Button onClick={deleteFromBatch} name={domain} className="domain-remove" variant="danger">X</Button>
			</div>
		))}
		</div>

		{ phase === 0 && 
		<Button onClick={() => setModalShow(true)} variant="primary">Request to Register</Button>
		}
		{ phase === 1 && 
		<div>
			<Spinner animation="border" variant="primary" />		
			<p>Waiting for commit to be confirmed by registrar...</p>
		</div>
		}
		{ phase === 2 && 
		<Button onClick={register} variant="primary">Register all domains</Button>
		}
		<MyModal
			 show={modalShow}
			 commit={request}
			 onHide={() => setModalShow(false)}
		/>
	</div>
	);
}

export default Main;
