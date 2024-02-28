// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ManyVarsInASlot {
    uint8 someUint8;
    int8 someInt8;
    bool someBool;
    bytes3 someHex;
    fixed aa;

    function set() public {
        someUint8 = 1;
        someInt8 = -2;
        someBool = true;
        someHex = hex"0a0b0c";
    }
}
