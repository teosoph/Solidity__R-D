// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ContractA.sol";

contract ContractB {
    ContractA public aContract;

    constructor (ContractA _aContract) payable {
        aContract = _aContract;
    }

    function pay() public {
        payable(aContract).transfer(1 ether);
//        payable(aContract).send(1 ether);
    }
}
