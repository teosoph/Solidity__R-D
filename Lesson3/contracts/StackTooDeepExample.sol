// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract StackTooDeepExample {
    function set() public {
        uint256 number1 = 2;
        uint256 number2 = 3;
        uint256 number3 = 4;
        uint256 number4 = 5;
        uint256 number5 = 6;
        uint256 number6 = 7;
        uint256 number7 = 8;
        uint256 number8 = 9;
        uint256 number9 = 10;
        uint256 number10 = 11;
        uint256 number11 = 12;
        uint256 number12 = 13;
        uint256 number13 = 14;
        uint256 number14 = 15;
        uint256 number15 = 16;
//        uint256 number16 = 17;
        require (number1 == 1);
    }
}
