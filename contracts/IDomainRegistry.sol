// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IDomainRegistry {
    function initialize() external;

    function registerDomain(string memory domainName) external payable;

    function updateRegistrationFee(uint256 newFee) external;

    function getDomainOwner(string memory domainName) external view returns (address);

    function getDomainNamesByIndex(uint256 startIndex, uint256 endIndex) external view returns (string[] memory);
}
