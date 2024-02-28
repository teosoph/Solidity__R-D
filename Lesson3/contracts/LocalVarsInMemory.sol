// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract LocalVarsInMemory {
    function set() public {
        uint[] memory numbers = new uint[](2);
        numbers[0] = 5;
        numbers[1] = 6;
    }
}
