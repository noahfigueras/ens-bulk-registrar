// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IETHRegistrarController {
	function available(string memory name) external view returns(bool);
	function register(string calldata name, address owner, uint duration, bytes32 secret) external payable;
	function rentPrice(string memory name, uint duration) external view returns(uint);
	function makeCommitment(string memory name, address owner, bytes32 secret) external pure returns(bytes32);
	function commit(bytes32 commitment) external;
}

contract BulkRegistrar {
	address private ETHRegistrarControllerAddress;
	
	constructor(address _ETHRegistrarControllerAddress) {
		ETHRegistrarControllerAddress = address(_ETHRegistrarControllerAddress);
	}	

	function getController() internal view returns(IETHRegistrarController) {
		return IETHRegistrarController(ETHRegistrarControllerAddress);
	} 

	function available (string memory name) external view returns(bool) {
		IETHRegistrarController controller = getController();	
	 	return controller.available(name);	
	}

	function rentPrice(string[] calldata names, uint duration) external view returns(uint total) {
		IETHRegistrarController controller = getController();
		for(uint i = 0; i < names.length; i++) {
				total += controller.rentPrice(names[i], duration);
		}
	}
		
	function submitCommit(string[] calldata names, address owner, bytes32 secret) external {
		IETHRegistrarController controller = getController();
		for(uint i = 0; i < names.length; i++) {
      		bytes32 commitment = controller.makeCommitment(names[i],owner,secret);
      		controller.commit(commitment);
    	}
	}

	function registerAll(string[] calldata names, address owner, uint duration, bytes32 secret) external payable {
		require(owner == msg.sender, "Error: Caller must be the same address as owner");
		IETHRegistrarController controller = getController();	
		for(uint i = 0; i < names.length; i++) {
			uint cost = controller.rentPrice(names[i], duration);
			controller.register{value:cost}(names[i], owner, duration, secret);
		}
		// Send any excess funds back
		payable(msg.sender).transfer(address(this).balance);
	}
}
