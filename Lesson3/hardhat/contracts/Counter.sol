// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint public count;

    // Function to get the current count
    function get() public view returns (uint) {
        return count;
    }

    // Function to increment count by 1
    function inc() public {
        count += 1;
    }

    // Function to decrement count by 1
    function dec() public {
        // This function will fail if count = 0
        count -= 1;
    }

    // This function is to demonstrate how to resolve JS object name conflicts
    function waitForDeployment() public pure returns (bool) {
        return true;
    }

    // This function is to demonstrate how to resolve JS object name conflicts
    function waitForDeployment(uint256 x) public pure returns (uint256) {
        return x * 2;
    }
}
