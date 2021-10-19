// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import './interfaces/IRERC20.sol';
import './interfaces/IWRToken.sol';

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';

contract ReflectTokenExchange {
    using SafeERC20 for IWRToken;
    using SafeERC20 for IRERC20;
    using SafeMath for uint256;

    IRERC20 public rToken;
    IWRToken public wrToken;

    event Deposit(address indexed user, uint256 lockedAmount, uint256 mintedAmount);
    event Withdraw(address indexed user, uint256 releasedAmount, uint256 burnedAmount);

    constructor(IRERC20 _rToken, IWRToken _wrToken) public {
        rToken = _rToken;
        wrToken = _wrToken;
    }

    /// Deposit reflect token, mint ERC20 token.
    /// @param _amount The amount of staking reflect tokens to deposit
    function deposit(uint256 _amount) external {
        if (_amount > 0) {
            uint256 lastStakedBalance = totalDepositedTokenBalance();
            rToken.safeTransferFrom(msg.sender, address(this), _amount);
            // rToken.transferFrom(msg.sender, address(this), _amount);
            uint256 currentStakeBalance = totalDepositedTokenBalance();
            uint256 finalDepositAmount = currentStakeBalance.sub(lastStakedBalance);

            uint256 mintValue;
            if (lastStakedBalance == 0) {
                mintValue = finalDepositAmount;
            } else {
                uint256 lastMintedBalance = totalMintedTokenBalance();
                mintValue = finalDepositAmount.mul(lastMintedBalance).div(lastStakedBalance);
            }
            wrToken.mint(msg.sender, mintValue);
            emit Deposit(msg.sender, finalDepositAmount, mintValue);
        }
    }

    /// Withdraw the staked reflect token.
    /// @param _amount The amount of minted tokens to withdraw
    function withdraw(uint256 _amount) external {
        if (_amount > 0) {
            uint256 lastStakedBalance = totalDepositedTokenBalance();
            uint256 lastMintedBalance = totalMintedTokenBalance();

            wrToken.safeTransferFrom(msg.sender, address(this), _amount);
            wrToken.burn(_amount);
            uint256 finalWithdrawAmount = _amount.mul(lastStakedBalance).div(lastMintedBalance);
            rToken.safeTransfer(msg.sender, finalWithdrawAmount);
            // rToken.transfer(msg.sender, finalWithdrawAmount);

            emit Withdraw(msg.sender, finalWithdrawAmount, _amount);
        }
    }

    // /* Get Funtions*/
    // /// @return wei rate of minted/staked
    // function pendingMint2StakeRate() external view returns (uint256) {
    //     uint256 rate = 1 ether;
    //     uint256 lastStakedBalance = totalDepositedTokenBalance();
    //     if (lastStakedBalance != 0) {
    //         uint256 lastMintedBalance = totalMintedTokenBalance();
    //         rate = lastMintedBalance.mul(1 ether).div(lastStakedBalance);
    //     }
    //     return rate;
    // }

    function getTokens() external view returns (address reflectToken, address wrapReflectToken) {
        reflectToken = address(rToken);
        wrapReflectToken = address(wrToken);
    }

    /* Private Funtions*/
    /// @return wei balace of reflect token(RERC20) that has been deposited into this contract
    function totalDepositedTokenBalance() private view returns (uint256) {
        // Return Reflect balance
        return rToken.balanceOf(address(this));
    }

    /// @return wei balace of minted the warp reflect token(ERC20)
    function totalMintedTokenBalance() private view returns (uint256) {
        // Return Minted balance
        return wrToken.totalSupply();
    }

}