// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    string private value;

    // Emitted when the stored value changes
    event ValueChanged(string newValue);

    // Stores a new value in the contract
    function store(string memory newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    // Reads the last stored value
    function retrieve() public view returns (string memory) {
        return value;
    }
}
