const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", function() {
  let fundMe;
  let deployer;
  let mockV3Aggregator;

  beforeEach(async function() {
    // Deploy the contract

    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("constructor", function() {
    it("Sets the aggregator address correctly", async function() {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", function() {
    it("Fails if you don't send enough ETH", async function() {
      await expect(fundMe.fund(), "to revert").to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });
    it("Updates the balance for each address correctly", async function() {
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(
        response.toString(),
        ethers.utils.parseEther("1").toString()
      );
    });
    it("Adds the sender address to the list of funded address", async function() {
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", function() {
    beforeEach(async function() {
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
    });
    it("can withdraw ETH from a single funder", async function() {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      // Act
      const txRresponse = await fundMe.withdraw();
      const txReceipt = await txRresponse.wait(1);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance),
        endingDeployerBalance.add(gasCost).toString()
      );
    });
  });
});
