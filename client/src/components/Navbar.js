import logo from './logo.svg';
import { Navbar as Nav } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, { useState } from 'react';

// CSS Styles
const onStyle = {
	marginRight: "20px"
}
const addrStyle = {
	marginRight: "15px",
	color: "white"
}

const Navbar = ({Provider, setProvider}) => {
	const [address, setAddress] = useState(null);
	const [active, setActive] = useState(false);

  	const providerOptions = {
		walletconnect: {
		  package: WalletConnectProvider,
		  options: {
			infuraId: "a7ce48e475b94eb49390e0fb9ffb1547", 
		  }
		}
  	};

  	const web3Modal = new Web3Modal({
		network: "mainnet", // optional
		cacheProvider: false, // optional
		providerOptions // required
	});

	// Functions
	const connect = async () => {
		try{
			const web3ModalProvider = await web3Modal.connect();
			const provider = new ethers.providers.Web3Provider(web3ModalProvider);
			const signer = await provider.getSigner();
			const addr = await signer.getAddress();
			setAddress(addr);
			setActive(true);
			setProvider(web3ModalProvider);
		} catch (e) {
			console.log("Error: conection to metamask failed");
		} 
  	}

	const disconnect = async () => {
		try{
			if(Provider.close){
				await Provider.close();
				setActive(false);
				setAddress(null);
			}
		} catch (e) {
			console.log("Error: Desconection to metamask failed");
		} 
	}

  return (
    <Nav bg="dark" variant="dark">
      <Container>
        <Nav.Brand href="#home">
        <img
          alt="logo"
          src={logo}
          width="30"
          height="30"
          className="d-inline-block align-top"
        />
        React Bootstrap
        </Nav.Brand>
      </Container>
			{ !active ? (
      <Button onClick={connect} style={onStyle} variant="primary">Connect</Button>
			)	: (
			<div>
				<span style={addrStyle}>{address.slice(0,4)}...{address.slice(38,42)}</span>
        <Button onClick={disconnect} style={onStyle} variant="secondary">Disconnect</Button>
			</div>
			)}
    </Nav>
  );
};

export default Navbar;
