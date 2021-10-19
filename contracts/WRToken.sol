// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// WRToken
contract WRToken is ERC20, Ownable {
    constructor (string memory name, string memory symbol, uint8 _decimals) public ERC20(name, symbol) {
        if (_decimals != decimals()) {
            _setupDecimals(_decimals);
        }
    }

    /// @notice Creates `_amount` token to `_to`. Must only be called by the owner (WanSwapFarm).
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) public {
        _burn(msg.sender, _amount);
    }
}
// contract WRToken is ERC20("TOM", "TOM"), Ownable {

//     function setDecimals(uint8 _decimals) public onlyOwner {
//         _setupDecimals(_decimals);
//     }

//     /// @notice Creates `_amount` token to `_to`. Must only be called by the owner (WanSwapFarm).
//     function mint(address _to, uint256 _amount) public onlyOwner {
//         _mint(_to, _amount);
//     }

//     function burn(uint256 _amount) public {
//         _burn(msg.sender, _amount);
//     }
// }