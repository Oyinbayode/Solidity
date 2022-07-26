const { assert } = require("chai");
const { deployments, ethers } = require("hardhat");

const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", async function () {
      let lottery, vrfCoordinatorV2Mock;
      const chainID = network.config.chainId;

      beforeEach(async function () {
        // Deploy Contract
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(["all"]);
        lottery = await ethers.getContract("Lottery", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", function () {
        it("Sets Lottery state initially to OPEN", async function () {
          const lotteryState = await lottery.getLotteryState();
          assert.equal(lotteryState.toString(), "0");
        });
        it("Sets Initial time interval to specified interval", async function () {
          const interval = await lottery.getInterval();
          assert.equal(interval.toString(), networkConfig[chainID].interval);
        });
        it("Sets the VRFCoordinator V2 Address to the correct address", async function () {
          const vrfCoordinatorV2Address = await lottery.getVRFCoordinator();
          assert.equal(vrfCoordinatorV2Address, vrfCoordinatorV2Mock.address);
        });
        it("Sets the entrance fee to the amount entered", async function () {
          const EntranceFee = await lottery.getEntranceFee();
          assert.equal(
            EntranceFee.toString(),
            networkConfig[chainID].entranceFee
          );
        });
        it("Sets the keyHash correctly", async function () {
          const keyHash = await lottery.getKeyHash();
          assert.equal(keyHash, networkConfig[chainID].keyHash);
        });
        it("Sets the subscriptionID correctly", async function () {
          const subID = await lottery.getSubscriptionID();

          // Act
          const txResponse = await vrfCoordinatorV2Mock.createSubscription();
          const txReceipt = await txResponse.wait(1);
          let subscriptionId = txReceipt.events[0].args.subId;

          // Assert
          assert.equal(subID.toString(), subscriptionId.toString());
        });
      });
    });
