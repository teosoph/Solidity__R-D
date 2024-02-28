// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract BalanceUtils {
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract ClientOfContractInsteadOfLibrary {
    BalanceUtils public balanceUtils;

    constructor(BalanceUtils _balanceUtils) payable {
        balanceUtils = _balanceUtils;
    }

    function getBalance() public view returns (uint) {
        return balanceUtils.getBalance();
    }

    function getBalanceNatively() public view returns (uint) {
        return address(this).balance;
    }
}
