// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;


 /*
 * HuckleberryFinance
 * Reflect Token implementation
 * App:             https://huckleberry.finance
 * GitHub:          https://github.com/huckleberryfinance
 */

interface IRERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function taxFee() external view returns (uint256);
    function maxTaxFee() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
    function isExcluded(address account) external view returns (bool);
    function totalFees() external view returns (uint256);
    function reflectionFromToken(uint256 tAmount, bool deductTransferFee) external view returns(uint256);
    function tokenFromReflection(uint256 rAmount) external view returns(uint256);

}
