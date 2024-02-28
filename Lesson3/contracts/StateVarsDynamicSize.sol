// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract StateVarsDynamicSize {
    uint[] public value;

    function set() public {
        value.push(5);
        value.push(6);
    }
}
