// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library MathUtils {
    function sqrt(uint y) public pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        // else z = 0 (default value)
    }
}

contract ClientOfLibraryWithPublicFunctions {
    function getSquareRoot(uint x) public pure returns (uint) {
        return MathUtils.sqrt(x);
    }
}
