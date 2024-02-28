pragma solidity ^0.8.0;
contract Foo {
    uint256[50] __gap;
    string StorageStr;
    function get() public {
        string memory MemoryStr = "some string";
        StorageStr = MemoryStr;
        MemoryStr = "some looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong string";
        StorageStr = MemoryStr;
    }
}
