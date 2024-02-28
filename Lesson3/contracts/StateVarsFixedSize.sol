// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract StateVarsFizedSize {
    uint public count1;
    uint public count2;

    function set() public {
        count1 = 2;
        count2 = 3;
    }
}
