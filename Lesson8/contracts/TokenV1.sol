// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TokenV1 is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    uint256[500] __gap;

    struct Data {
        uint256 num;
        bool flag;
        uint256[48] __gap;
    }

    Data public data;
    mapping(address => bool) public blacklist;

    function initialize() initializer public {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(!blacklist[to], "Address is blacklisted");
        _mint(to, amount);
    }

    function putToBlacklist(address addr) public onlyOwner {
        blacklist[addr] = true;
    }
}
