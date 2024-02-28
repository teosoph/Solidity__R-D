// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorageV1  {
    uint public num;

    function set(uint _num) public {
        num = _num;
    }

    function get() public view returns (uint) {
        return num;
    }
}
