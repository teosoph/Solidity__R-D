// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract ContractFactory {
    function createContract(string calldata name)
    public
    returns (SimpleContract tokenAddress)
    {
        // Create a new `SimpleContract` contract and return its address.
        // From the JavaScript side, the return type
        // of this function is `address`, as this is
        // the closest type available in the ABI.
        return new SimpleContract(name);
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
