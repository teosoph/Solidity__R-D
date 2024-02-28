// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ContractA {
    uint public a;

    constructor(){
        a = 1;
    }

    receive() external payable {
        // saving to state var makes it run out of gas
        a = 2;
    }

    fallback() external {
        // saving to state var makes it run out of gas
        a = 3;
    }
}
