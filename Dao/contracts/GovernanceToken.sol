// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 public constant MAXIMUM_SUPPLY = 1000000000000000000000000000;

    constructor()
        ERC20("Governance Token", "GOV")
        ERC20Permit("Governance Token")
    {
        _mint(msg.sender, MAXIMUM_SUPPLY);
    }

    // Create a snapshot of the current state of the token at certain block

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address from, uint256 amount) internal override(ERC20Votes) {
        super._burn(from, amount);
    }
}
