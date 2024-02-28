// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

// Base1  Base2
//   \     /
//   Inherited

contract Base1
{
    function foo() virtual public pure returns(string memory) {
        return "Base1";
    }
}

contract Base2
{
    function foo() virtual public pure returns(string memory) {
        return "Base2";
    }
}

contract Inherited is Base1, Base2
{
    // Derives from multiple bases defining foo(), so we must explicitly
    // override it
    function foo() public override(Base1, Base2) pure returns(string memory) {
        return super.foo();
    }
}
