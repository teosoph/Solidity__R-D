// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library BalanceUtils {
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract LibraryWhereItShouldBe {
    constructor() payable {}

    function getBalance() public view returns (uint) {
        return BalanceUtils.getBalance();
    }

    function getBalanceNatively() public view returns (uint) {
        return address(this).balance;
    }
}
