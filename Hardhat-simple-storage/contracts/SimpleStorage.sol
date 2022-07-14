// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Import this file to use console.log
import "hardhat/console.sol";

contract SimpleStorage {
    uint256 public myNumber;

    mapping(string => uint256) public nameToFavoriteNumber;

    struct People {
        uint32 Age;
        string FirstName;
    }

    People[] public people;

    function addPerson(string memory _FirstName, uint32 _Age) public {
        people.push(People(_Age, _FirstName));
    }

    function store(uint256 _myNumber) public virtual {
        myNumber = _myNumber;
    }

    function retrieve() public view returns (uint256) {
        return myNumber;
    }
}
