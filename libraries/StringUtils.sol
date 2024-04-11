// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StringUtils
 * @notice This library provides utility functions for string manipulations, specifically tailored for domain-related operations.
 * @dev Contains methods for protocol removal, string slicing, prefix checking, and domain validation. Some functions employ inline assembly for optimization.
 */
library StringUtils {
    /**
     * @notice Efficiently slices a bytes array from the given start position for the specified length using inline assembly.
     * @param data The original bytes array.
     * @param start The starting position for the slice.
     * @param len The length of the slice.
     * @return The resulting bytes array slice.
     */
    function slice(bytes memory data, uint start, uint len) internal pure returns (bytes memory) {
        bytes memory result = new bytes(len);

        assembly {
            // Указатель на начало данных в исходном массиве
            let data_ptr := add(add(data, 0x20), start)

            // Указатель на начало данных в результирующем массиве
            let result_ptr := add(result, 0x20)

            // Копирование среза данных
            for {
                let end_ptr := add(data_ptr, len)
            } lt(data_ptr, end_ptr) {
                data_ptr := add(data_ptr, 0x20)
                result_ptr := add(result_ptr, 0x20)
            } {
                mstore(result_ptr, mload(data_ptr))
            }
        }

        return result;
    }

    /**
     * @notice Validates a domain based on basic RFC 1035 rules using inline assembly for character iteration and checks.
     * @dev This is a basic check. Some other rules from RFC 1035 may not be enforced.
     * @param domainName The domain name to validate.
     * @return Whether the domain is valid.
     */

    function isValidDomain(string memory domainName) internal pure returns (bool) {
        bytes memory domainBytes = bytes(domainName);
        uint256 len = domainBytes.length;

        // Check the domain length to ensure it falls within the allowed range
        if (len < 1 || len > 63) {
            return false;
        }

        bool isValid = true;
        uint8 hyphenCount = 0;

        assembly {
            let dataStart := add(domainBytes, 0x20) // Start of the domain data
            let dataEnd := add(dataStart, len) // End of the domain data

            // Check if the domain starts or ends with a hyphen ('-')
            if or(eq(byte(0, mload(dataStart)), 0x2D), eq(byte(0, mload(sub(dataEnd, 1))), 0x2D)) {
                isValid := 0
            }

            let prevChar := 0x00 // Previous character, used for checking consecutive characters

            for {

            } and(isValid, lt(dataStart, dataEnd)) {
                // Loop through each character
                dataStart := add(dataStart, 1)
            } {
                let char := byte(0, mload(dataStart)) // Current character

                // Increment hyphen count if a hyphen is found
                if eq(char, 0x2D) {
                    hyphenCount := add(hyphenCount, 1)
                    // Invalidate if more than one consecutive hyphen
                    if gt(hyphenCount, 1) {
                        isValid := 0
                    }
                }

                // Reset hyphen count if a dot is found
                if eq(char, 0x2E) {
                    hyphenCount := 0
                }

                // Check if character is a valid number or letter and reset hyphen count
                if or(
                    or(
                        and(iszero(lt(char, 0x30)), iszero(gt(char, 0x39))), // Numbers 0-9
                        and(iszero(lt(char, 0x61)), iszero(gt(char, 0x7A))) // Lowercase a-z
                    ),
                    and(iszero(lt(char, 0x41)), iszero(gt(char, 0x5A))) // Uppercase A-Z
                ) {
                    hyphenCount := 0
                }

                if and(
                    and(iszero(eq(char, 0x2E)), iszero(eq(char, 0x2D))),
                    and(
                        and(or(lt(char, 0x30), gt(char, 0x39)), or(lt(char, 0x61), gt(char, 0x7A))),
                        or(lt(char, 0x41), gt(char, 0x5A))
                    )
                ) {
                    // Invalidate if character is not a dot, hyphen, number, or letter
                    isValid := 0
                }
            }
        }

        return isValid;
    }

    /**
     * @notice Splits a domain name string into its constituent parts using inline assembly for character iteration.
     * @dev The function makes two passes through the domain string: counting dots and extracting parts.
     * @param domainName The complete domain name string to be parsed and split.
     * @return parts An array containing individual parts of the domain name split by dots.
     */
    function splitDomain(string memory domainName) internal pure returns (string[] memory) {
        uint length = bytes(domainName).length;
        uint count = 1; // At least one domain part

        // First pass: count dots
        for (uint i = 0; i < length; i++) {
            bytes1 char;
            assembly {
                char := mload(add(add(domainName, 0x20), i))
            }
            if (char == ".") {
                count++;
            }
        }

        string[] memory parts = new string[](count);
        uint startIndex = 0;
        uint arrayIndex = 0;

        // Second pass: extract parts
        for (uint i = 0; i < length; i++) {
            bytes1 char;
            assembly {
                char := mload(add(add(domainName, 0x20), i))
            }
            if (char == "." || i == length - 1) {
                uint endIndex = char == "." ? i : i + 1;
                bytes memory part = new bytes(endIndex - startIndex);
                for (uint j = 0; j < part.length; j++) {
                    assembly {
                        mstore(add(add(part, 0x20), j), mload(add(add(domainName, 0x20), add(startIndex, j))))
                    }
                }
                parts[arrayIndex] = string(part);
                arrayIndex++;
                startIndex = i + 1;
            }
        }

        return parts;
    }
}
