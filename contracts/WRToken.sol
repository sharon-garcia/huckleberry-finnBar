// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// WRToken
contract WRToken is ERC20Burnable, Ownable {
    constructor (string memory name, string memory symbol, uint8 _decimals) public ERC20(name, symbol) {
        if (_decimals != decimals()) {
            _setupDecimals(_decimals);
        }
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
