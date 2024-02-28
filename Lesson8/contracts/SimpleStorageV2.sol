// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorageV2 {
    uint public num;
    uint public num2;

    function set(uint _num) public {
        num = _num;
    }

    function set2(uint _num) public {
        num2 = _num;
    }

    function get() public view returns (uint) {
        return num;
    }

    function get2() public view returns (uint) {
        return num2;
    }
}
