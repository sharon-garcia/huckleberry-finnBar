// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// FINN
contract MockERC20 is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint8 _decimals,
        uint256 mintAmount
    ) public ERC20(name, symbol) {
        _setupDecimals(_decimals);
        _mint(msg.sender, mintAmount);
    }
}
