// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TokenV2 is Initializable, ERC20Upgradeable, Ownable2StepUpgradeable {
    uint256[450] __gap;

    struct Data {
        uint256 num;
        bool flag;
        string misc;
        uint256[47] __gap;
    }

    Data public data;
    mapping(address => bool) public blacklist;
    string public foo;

    function mint(address to, uint256 amount) public onlyOwner {
        require(!blacklist[to], "Address is blacklisted");
        _mint(to, amount);
    }

    function putToBlacklist(address addr) public onlyOwner {
        blacklist[addr] = true;
    }
}
