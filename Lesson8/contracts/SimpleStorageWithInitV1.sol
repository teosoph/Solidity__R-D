// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SimpleStorageWithInitV1 is Initializable {
    uint public num;

    function initialize(uint _num) public initializer {
        num = _num;
    }

    function set(uint _num) public {
        num = _num;
    }

    function get() public view returns (uint) {
        return num;
    }
}
