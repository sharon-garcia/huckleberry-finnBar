const WRToken = artifacts.require("WRToken");
const ReflectTokenExchange = artifacts.require("ReflectTokenExchange");
const FINN = artifacts.require("FINN");
const Ownable = artifacts.require("Ownable");
const MockERC20 = artifacts.require("MockERC20");
const { expectRevert, time } = require('@openzeppelin/test-helpers');
const assert = require('assert');

// let block = await web3.eth.getBlock("latest")
module.exports = async function(deployer, network, accounts) {

    // console.log("accounts:", accounts)
    // return;
    let [ owner, alice, bob] = accounts
    // await deployer.deploy(FINN);
    // let rToken = FINN.deployed();

    await deployer.deploy(MockERC20, "TestToken", "TST", 18, 100000000);
    let rToken = await MockERC20.deployed();
    console.log("rToken:", rToken.address)

    await deployer.deploy(WRToken, "TomToken", "TOM", 18);
    let wrToken = await WRToken.deployed();
    console.log("wrToken:", wrToken.address)

    await deployer.deploy(ReflectTokenExchange, rToken.address, wrToken.address);
    let exchange = await ReflectTokenExchange.deployed();

    console.log("rToken old owner:", await rToken.owner())
    await rToken.transferOwnership(exchange.address, {from: owner});
    console.log("rToken new owner:", await rToken.owner())

    let {reflectToken, wrapReflectToken} = await exchange.getTokens();
    assert.strictEqual(reflectToken, rToken.address, "invalid reflect token");
    assert.strictEqual(wrapReflectToken, wrToken.address, "invalid wrap reflect token");

    let initAmount = 10000
    console.log("alice:", alice, "bob:", bob, "owner:", owner)
    await rToken.transfer(alice, initAmount, {from: owner});
    await rToken.transfer(bob, initAmount, {from: owner});
    assert.strictEqual((await rToken.balanceOf(alice)).eq(new web3.utils.BN(initAmount)), true, "invalid alice init amount");
    assert.strictEqual((await rToken.balanceOf(bob)).eq(new web3.utils.BN(initAmount)), true, "invalid bob init amount");
    console.log("alice reflect balance:", (await rToken.balanceOf(alice)).toString(10), ", bob reflect balance:", (await rToken.balanceOf(bob)).toString(10))

    let exchangeStakedBalanceNoDeposit = await rToken.balanceOf(exchange.address);
    let exchangeMintedBalanceNoDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceNoDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange staked deposit");
    assert.strictEqual(exchangeMintedBalanceNoDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange minted deposit");

    await exchange.deposit(100, {from: alice});
    let exchangeStakedBalanceAliceDeposit = await rToken.balanceOf(alice);
    let exchangeMintedBalanceAliceDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceAliceDeposit.eq(new web3.utils.BN(100)), true, "invalid exchange alice staked deposit");
    assert.strictEqual(exchangeMintedBalanceAliceDeposit.eq(new web3.utils.BN(100)), true, "invalid exchange alice minted deposit");

    await time.advanceBlock();
    await exchange.withdraw(100, {from: alice});
    exchangeStakedBalanceAliceDeposit = await rToken.balanceOf(alice);
    exchangeMintedBalanceAliceDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceAliceDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange alice staked withdraw");
    assert.strictEqual(exchangeMintedBalanceAliceDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange alice minted withdraw");

    await exchange.deposit(100, {from: bob});
    let exchangeStakedBalanceBobDeposit = await rToken.balanceOf(bob);
    let exchangeMintedBalanceBobDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceBobDeposit.eq(new web3.utils.BN(100)), true, "invalid exchange bob staked deposit");
    assert.strictEqual(exchangeMintedBalanceBobDeposit.eq(new web3.utils.BN(100)), true, "invalid exchange bob minted deposit");

    await time.advanceBlock();
    await exchange.withdraw(100, {from: bob});
    exchangeStakedBalanceBobDeposit = await rToken.balanceOf(bob);
    exchangeMintedBalanceBobDeposit = await wrToken.totalSupply();
    assert.strictEqual(exchangeStakedBalanceBobDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange bob staked withdraw");
    assert.strictEqual(exchangeMintedBalanceBobDeposit.eq(new web3.utils.BN(0)), true, "invalid exchange bob minted withdraw");
};