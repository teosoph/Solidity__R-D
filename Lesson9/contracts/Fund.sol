// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

// THIS CONTRACT CONTAINS A BUG - DO NOT USE
contract Fund {
    mapping(address => uint) public shares;

    function deposit() public payable {
        shares[msg.sender] += msg.value;
    }

    function withdraw() public {
        // very critical bug: call (forward all gas or set gas, returns bool)
        (bool success,) = msg.sender.call{value: shares[msg.sender]}("");
        if (success)
            shares[msg.sender] = 0;
    }

//    function withdraw() public {
//        // less critical bug: send (2300 gas, returns bool)
//        if (payable(msg.sender).send(shares[msg.sender]))
//            shares[msg.sender] = 0;
//    }
//
//    function withdraw() public {
//        // less critical bug: transfer (2300 gas, throws error)
//        payable(msg.sender).transfer(shares[msg.sender]);
//        shares[msg.sender] = 0;
//    }

//    function withdraw() public {
//        // Checks-Effects-Interactions pattern
//        uint share = shares[msg.sender];
//        if (share > 0) {
//            shares[msg.sender] = 0;
//            payable(msg.sender).transfer(share);
//        }
//    }
}




