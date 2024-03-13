// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleMessage {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }
}
