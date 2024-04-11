// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/StringUtils.sol";

/**
 * @title DomainUtils
 * @notice This library offers utility functions for domain-related operations.
 * @dev Provides functionality to determine parent domains, check subdomain relationships, and more.
 */
library DomainUtils {
    function parentDomain(string memory domainName) external pure returns (string memory) {
        string[] memory parts = StringUtils.splitDomain(domainName);
        string memory result = "";
        if (parts.length > 1) {
            for (uint i = 1; i < parts.length; i++) {
                if (i != 1) {
                    result = string(abi.encodePacked(result, "."));
                }
                result = string(abi.encodePacked(result, parts[i]));
            }
        }
        return result;
    }
}
