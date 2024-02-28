// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Arrays {
    bytes3 public b3 = hex"001122";
    bytes3[] public b3darr;
    bytes3[3] public b3arr;
    bytes public b = hex"001122";

    constructor () {
        b3darr.push(hex"001122");
        b3darr.push(hex"334455");
        b3darr.push(hex"667788");

        b3arr[0] = hex"001122";
        b3arr[1] = hex"334455";
        b3arr[2] = hex"667788";

        b3 = hex"001122";
    }

    function getSomeData() public view returns (bytes1, bytes1, bytes1, bytes1) {
        return (b3[2], b3darr[2][2], b3arr[2][2], b[2]);
    }
}
