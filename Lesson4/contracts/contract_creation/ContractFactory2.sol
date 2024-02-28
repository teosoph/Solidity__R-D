// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Factory {
    function deploy(
        string calldata _name,
        bytes32 _salt
    ) public payable returns (address) {
        return address(new SimpleContract{salt: _salt}(_name));
    }

    function getAddress(
        uint _salt,
        bytes calldata _bytecode
    ) public view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(_bytecode))
        );

        // NOTE: cast last 20 bytes of hash to address
        return address(uint160(uint(hash)));
    }
}

contract SimpleContract {
    address public owner;
    string public name;

    constructor(string memory name_) {
        owner = msg.sender;
        name = name_;
    }
}
