// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract ThisAndWithoutThis {
    function publicFn() public returns (uint) {
        console(msg.sender); // your address
        return 1;
    }

    function someFn() public returns (uint) {
        console.log(msg.sender); // your address
        return this.publicFn();
    }
}
