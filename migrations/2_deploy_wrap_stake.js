const WRToken = artifacts.require("WRToken");
const ReflectTokenExchange = artifacts.require("ReflectTokenExchange");
const FINN = artifacts.require("FINN");
const MockERC20 = artifacts.require("MockERC20");
const { expectRevert, time } = require('@openzeppelin/test-helpers');
const assert = require('assert');

module.exports = async function(deployer, network, accounts) {

    let initSupply = 100000000;
    let [owner, alice, bob] = accounts;

    await deployer.deploy(FINN, initSupply);
    let rToken = await FINN.deployed();

    // await deployer.deploy(MockERC20, "TestToken", "TST", 18, initSupply);
    // let rToken = await MockERC20.deployed();
    console.log("rToken:", rToken.address)

    await deployer.deploy(WRToken, "TomToken", "TOM", 18);
    let wrToken = await WRToken.deployed();
    console.log("wrToken:", wrToken.address)

    await deployer.deploy(ReflectTokenExchange, rToken.address, wrToken.address);
    let exchange = await ReflectTokenExchange.deployed();

    console.log("wrToken old owner:", await wrToken.owner())
    await wrToken.transferOwnership(exchange.address, {from: owner});
    console.log("wrToken new owner:", await wrToken.owner())

    let {reflectToken, wrapReflectToken} = await exchange.getTokens();
    assert.strictEqual(reflectToken, rToken.address, "invalid reflect token");
    assert.strictEqual(wrapReflectToken, wrToken.address, "invalid wrap reflect token");

    let initAmount = 10000;
    console.log("alice:", alice, "bob:", bob, "owner:", owner)
    await rToken.transfer(alice, initAmount, {from: owner});
    await rToken.transfer(bob, initAmount, {from: owner});
    let aliceReceivedAmount = await rToken.balanceOf(alice);
    let bobReceivedAmount = await rToken.balanceOf(bob);
    assert.strictEqual(aliceReceivedAmount.lte(new web3.utils.BN(initAmount)), true, "invalid alice init amount");
    assert.strictEqual(bobReceivedAmount.lte(new web3.utils.BN(initAmount)), true, "invalid bob init amount");
    console.log("alice reflect balance:", aliceReceivedAmount.toString(10), ", bob reflect balance:", bobReceivedAmount.toString(10))

    let exchangeStakedBalanceNoDeposit = await rToken.balanceOf(exchange.address);
    let exchangeMintedBalanceNoDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceNoDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange staked deposit");
    assert.strictEqual(exchangeMintedBalanceNoDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange minted deposit");

    let depositAmount = 100;
    await rToken.approve(exchange.address, depositAmount, {from: alice});
    let aliceDepositReceipt = await exchange.deposit(depositAmount, {from: alice});

    let exchangeStakedBalanceAliceDeposit = await rToken.balanceOf(exchange.address);
    let exchangeMintedBalanceAliceDeposit = await wrToken.totalSupply();
    console.log("exchangeStakedBalanceAliceDeposit:", exchangeStakedBalanceAliceDeposit.toString(10))
    console.log("exchangeMintedBalanceAliceDeposit:", exchangeMintedBalanceAliceDeposit.toString(10))
    assert.strictEqual(exchangeStakedBalanceAliceDeposit.lte(new web3.utils.BN(depositAmount)), true, "invalid exchange alice staked deposit");
    assert.strictEqual(exchangeMintedBalanceAliceDeposit.lte(new web3.utils.BN(depositAmount)), true, "invalid exchange alice minted deposit");
    assert.strictEqual(aliceDepositReceipt.logs[0].args.user, alice, "invalid exchange alice user deposit");

    let aliceLockedAmount = aliceDepositReceipt.logs[0].args.lockedAmount
    let aliceMintedAmount = aliceDepositReceipt.logs[0].args.mintedAmount;

    await time.advanceBlock();
    await wrToken.approve(exchange.address, aliceMintedAmount, {from: alice});
    let aliceWithdrawReceipt = await exchange.withdraw(aliceMintedAmount, {from: alice});
    exchangeStakedBalanceAliceDeposit = await rToken.balanceOf(exchange.address);
    exchangeMintedBalanceAliceDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceAliceDeposit.gte(new web3.utils.BN(0)), true, "invalid exchange alice staked withdraw");
    assert.strictEqual(exchangeMintedBalanceAliceDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange alice minted withdraw");
    assert.strictEqual(aliceWithdrawReceipt.logs[0].args.user, alice, "invalid exchange alice user withdraw");

    let aliceReleasedAmount = aliceWithdrawReceipt.logs[0].args.releasedAmount
    let aliceBurnAmount = aliceWithdrawReceipt.logs[0].args.burnedAmount;
    assert.strictEqual(aliceBurnAmount.eq(aliceMintedAmount), true, "invalid exchange alice mint and burn amount");
    assert.strictEqual(aliceReleasedAmount.gte(aliceLockedAmount), true, "invalid exchange alice lock and release amount");

    await rToken.approve(exchange.address, depositAmount, {from: bob});
    let bobDepositReceipt = await exchange.deposit(depositAmount, {from: bob});
    let exchangeStakedBalanceBobDeposit = await rToken.balanceOf(exchange.address);
    let exchangeMintedBalanceBobDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceBobDeposit.lte(new web3.utils.BN(depositAmount)), true, "invalid exchange bob staked deposit");
    assert.strictEqual(exchangeMintedBalanceBobDeposit.lte(new web3.utils.BN(depositAmount)), true, "invalid exchange bob minted deposit");
    assert.strictEqual(bobDepositReceipt.logs[0].args.user, bob, "invalid exchange bob user deposit");

    let bobLockedAmount = bobDepositReceipt.logs[0].args.lockedAmount
    let bobMintedAmount = bobDepositReceipt.logs[0].args.mintedAmount;

    await time.advanceBlock();
    await wrToken.approve(exchange.address, bobLockedAmount, {from: bob});
    let bobWithdrawReceipt = await exchange.withdraw(bobLockedAmount, {from: bob});
    exchangeStakedBalanceBobDeposit = await rToken.balanceOf(exchange.address);
    exchangeMintedBalanceBobDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceBobDeposit.gte(new web3.utils.BN(0)), true, "invalid exchange bob staked withdraw");
    assert.strictEqual(exchangeMintedBalanceBobDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange bob minted withdraw");

    assert.strictEqual(bobWithdrawReceipt.logs[0].args.user, bob, "invalid exchange bob user withdraw");

    let bobReleasedAmount = bobWithdrawReceipt.logs[0].args.releasedAmount
    let bobBurnAmount = bobWithdrawReceipt.logs[0].args.burnedAmount;
    assert.strictEqual(bobBurnAmount.eq(bobMintedAmount), true, "invalid exchange bob mint and burn amount");
    // assert.strictEqual(bobReleasedAmount.gte(bobLockedAmount), true, "invalid exchange bob lock and release amount");
};