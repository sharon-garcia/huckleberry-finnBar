// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;


 /*
 * HuckleberryFinance
 * Reflect Token implementation
 * App:             https://huckleberry.finance
 * GitHub:          https://github.com/huckleberryfinance
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWRToken is IERC20 {
    function mint(address _to, uint256 _amount) external;
    function burn(uint256 _amount) external;
}
