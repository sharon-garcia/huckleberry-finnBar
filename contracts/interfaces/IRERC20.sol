// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;


 /*
 * HuckleberryFinance
 * Reflect Token implementation
 * App:             https://huckleberry.finance
 * GitHub:          https://github.com/huckleberryfinance
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRERC20 is IERC20 {
    function taxFee() external view returns (uint256);
    function maxTaxFee() external view returns (uint256);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
    function isExcluded(address account) external view returns (bool);
    function totalFees() external view returns (uint256);
    function reflectionFromToken(uint256 tAmount, bool deductTransferFee) external view returns(uint256);
    function tokenFromReflection(uint256 rAmount) external view returns(uint256);

}
