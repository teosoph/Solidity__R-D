// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Storage {
    uint256 public value;

    function set(uint256 v) public {
        value = v;
    }

    function foo(uint256[] calldata arr) public {
        return;
    }

    function foo2(string calldata str, bool b, uint256[] calldata arr) public {
        return;
    }
}
