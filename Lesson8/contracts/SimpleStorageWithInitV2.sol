// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SimpleStorageWithInitV2 is Initializable {
    uint public num;
    uint public num2;

    function reinitialize(uint _num) public reinitializer(2) {
        num = _num;
    }

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
