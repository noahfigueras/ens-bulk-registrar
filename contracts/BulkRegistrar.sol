// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IETHRegistrarController {
	function available(string memory name) external view returns(bool);
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
}
