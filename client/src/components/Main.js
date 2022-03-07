import logo from './logo.svg';
import './components.css'; 
import { ethers } from 'ethers'; import React, { useState, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const Main = ({Provider}) => {
	let provider;
	let signer;

	if(Provider !== null) {
		provider = new ethers.providers.Web3Provider(Provider);
		signer = provider.getSigner();
	}
	
	const [Addr, setAddr] = useState("");
	const [input, setInput] = useState("");
	const [domains, setDomains] = useState([]);
	const [duration, setDuration] = useState(1);
	const [rent, setRent] = useState("0.0");
	const [phase, setPhase] = useState(0);
	const [pass, setPass] = useState();
	const [alerts, setAlerts] = useState([]);
	const [txs, setTxs] = useState([]);
	const [txTrigger, setTxTrigger] = useState(false);
	const [finalTransaction, setFinalTransaction] = useState(false);

	//const contractAddress ='0xf775A7a44787Ac51a6738D61E005E6a7D8340503'; // MAINNET
	const contractAddress ='0xc4364903FC6212D4054BBdA1a27a47a068EDC46c'; // ROPSTEN 
	const resolver = '0xDaaF96c344f63131acadD0Ea35170E7892d3dfBA'; // ROPSTEN
	const ABI = [
		"function available (string memory name) external view returns(bool)",
		"function rentPrice(string[] calldata names, uint duration) external view returns(uint total)",
		"function submitCommit(string[] calldata names, address owner, bytes32 secret, address resolver, address addr) external",
		"function registerAll(string[] calldata names, address _owner, uint duration, bytes32 secret, address resolver, address addr) external payable",
		"function FEE() external view returns(uint)",
		"function perc_gasFee() external view returns(uint)",
		"function flatFee() external view returns(bool)"
	];

	const addToBatch = async () => {
		if(phase === 1){
			return;
		}
		try{
			const domain = input;
			const contract = await _initContract(); 
			const available = await contract.available(domain);
			if(!available) {
				throw 'ENS Name is Already Taken';
			} 
			setDomains(oldD => [...oldD, domain]);	
			setInput("");
		} catch(err) {
			setAlerts([err]);
		}		
	};
	
	const deleteFromBatch = (e) => {
		if(phase === 1){
			return;
		}	
		const name = e.target.name;
		setDomains(domains.filter((item) => item !== name));
	}


	const request = async () => {
		try{
			const contract = _initContract();	
			const addr = await signer.getAddress();
			setAddr(addr);
			// Setting unique password
			const hash = await signer.signMessage("Setting password for recovery");
			const secret = hash.slice(0,66);
			setPass(secret);
			// Submit request transaction
			const tx = await contract.submitCommit(domains, addr, secret, resolver, addr);
			setTxs(oldT => [...oldT, { id: 1, state: 'pending... ' ,link: 'https://etherscan.io/tx/' + tx.hash}]);
			setPhase(1);
			// Wait for confirmation
			await tx.wait();
			// Update tx state
			setTxTrigger([true, 1]);
			// Wait 1min before register
			await _delay(65000); 
			setPhase(2);
		} catch(err) {
			if(err.code !== undefined){
				console.log(err);
				return;
			}
			setAlerts([err]);
		}
	}

	const register = async () => {
		try{
			let fee;
			const contract = _initContract();	
			const addr = await signer.getAddress();
			const _duration = _getDuration(); 
			const isFlatFee = await contract.flatFee();
			const perc_gasFee = await contract.perc_gasFee();
			const _rent = await contract.rentPrice(domains, _duration); 
			const estimate = await contract.estimateGas.registerAll(domains, addr, _duration, pass, resolver, addr, {value: _rent.add(ethers.utils.parseEther("0.01"))}); 
			const estimateGas = estimate.add(ethers.BigNumber.from("10000")); 
			const gasPrice = await provider.getGasPrice();

			// Add corresponding fee
			if(!isFlatFee){
				fee = estimateGas.mul(perc_gasFee).div(ethers.BigNumber.from("100")).mul(gasPrice); 
				console.log(fee);
			} else {
				fee = await contract.FEE();
			}

			const _value = _rent.add(fee);
			const tx = await contract.registerAll(domains, addr, _duration, pass, resolver, addr, {value: _value, gasLimit: estimateGas}); 
			setTxs(oldT => [...oldT, {id: 2, state: 'pending... ' ,link: 'https://etherscan.io/tx/' + tx.hash}]);
			// Wait for confirmation 
			await tx.wait();
			// Update tx state
			setTxTrigger([true, 2]);
			// Build final Transaction
			setFinalTransaction(true);
			setPhase(0);
		} catch(err) {
			console.log(err);
		}
	}
	
	const FinalTransaction = () => {
		return (
		<div>
			<hr/>
			<p>Please go to <a href={`https://app.ens.domains/address/${Addr}`}>ens</a> to control them</p>
			<p>or View on OpenSea <a href={`https://opensea.io/assets/${Addr}`}>here</a></p>
		</div>
		);
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
			throw 'Please connect to your MetaMask or WalletConnect Wallet.';
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

	const resetAlerts = async () => {
		await _delay(10000);
		setAlerts([]);
	}

	const updateTx = (id, _state) => {

		const newTxs = txs.map(tx => {
			if(id === tx.id) {
				return { ...tx, state: _state };
			}
			return tx;
		});
		setTxs(newTxs);
	}

	useEffect(() => {
		calculateRent();	
		resetAlerts();
		if(txTrigger[0]) {
			const msg = txTrigger[1] === 2 ? "Complete. Your ENS names have been registered." : "Complete";
			updateTx(txTrigger[1], msg);
			setTxTrigger(false);
		}
	}, [duration, domains, alerts, txs]);

	return (
	<div className="App-header">
		<img src={logo} className="App-logo" alt="logo" />
		<div className="info">
			<p>
				By registering your ENS names together, you can save gas by minimizing
				transactions. 
			</p>
			<p>
				Using this service you save an estimated 2-25% on your 
				gas fee. 
			</p>
			<p>
				We take 5% of the savings and pass along the rest of the 
				savings to you!
			</p>
			<a href="https://etherscan.io/address/0xf775a7a44787ac51a6738d61e005e6a7d8340503"> 
				View Contract 
			</a>
			<p>Contact us directly on Twitter 
			<a href=" https://twitter.com/ENSBulk">
				@ENSBulk
			</a>
			</p>
		</div>
		{ Provider !== null ? (
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
		) : (
		<h4> Please connect to your MetaMask or WalletConnect Wallet.</h4>
		)}
		<div id="alertBox">
		{alerts.map((a,id) => (
			<Alert key={id} variant="primary">
				{a}
			</Alert>
		))}
		</div>

		<div id="domains-box">
		{domains.map((domain,id) => (
			<div key={id} className="single-domain">
				<p><span>{id+1}.</span> {domain + '.eth'}</p>	
				<Button onClick={deleteFromBatch} name={domain} className="domain-remove" variant="danger">X</Button>
			</div>
		))}
		</div>

		{ phase === 0 && 
		<Button onClick={request} variant="primary">Request to Register</Button>
		}
		{ phase === 1 && 
		<div>
			<Spinner animation="border" variant="primary" />		
			<p>Please wait 1 minute prior to submitting the next transaction...</p>
		</div>
		}
		{ phase === 2 && 
		<Button onClick={register} variant="primary">Complete Registration</Button>
		}

		<div id="transactions">
		{txs.map((tx,id) => (
			<div key={id}>
				<p>Transaction {id+1} is {tx.state}</p>
				<a href={tx.link}>View on etherscan</a>
			</div>
		))}
		{finalTransaction && 
			<FinalTransaction/>
		}
		</div>

		<div id="register-info">
			<div className="register-block">
				<div className="number">
					<p>1</p>
				</div>
				<div className="register-description">
					<p><b>Request to Register</b></p>
					<p>Your wallet will open and you will be asked to confirm the first of two transactions required for registration. If the second transaction is not processed within 7 days of the first, you will need to start again from step 1.</p>
				</div>
			</div>
			<div className="register-block">
				<div className="number">
					<p>2</p>
				</div>
				<div className="register-description">
					<p><b>Wait for 1 minute</b></p>
					<p>The waiting period is required to ensure another person hasn’t tried to register the same name and protect you after your request.</p>
				</div>
			</div>
			<div className="register-block">
				<div className="number">
					<p>3</p>
				</div>
				<div className="register-description">
					<p><b>Complete Registration</b></p>
					<p>Click ‘register’ and your wallet will re-open. Only after the 2nd transaction is confirmed you'll know if you got the name.</p>
				</div>
			</div>
		</div>

	</div>
	);
}

export default Main;
