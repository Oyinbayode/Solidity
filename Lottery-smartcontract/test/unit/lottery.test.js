const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");

const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", async function () {
      let lottery, vrfCoordinatorV2Mock, lotteryEntranceFee, deployer, interval;
      const chainID = network.config.chainId;

      beforeEach(async function () {
        // Deploy Contract
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        lottery = await ethers.getContract("Lottery", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        lotteryEntranceFee = await lottery.getEntranceFee();
      });

      describe("constructor", function () {
        it("Sets Lottery state initially to OPEN", async function () {
          const lotteryState = await lottery.getLotteryState();
          assert.equal(lotteryState.toString(), "0");
        });
        it("Sets Initial time interval to specified interval", async function () {
          interval = await lottery.getInterval();
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
        it("Sets the callbackGasLimit correctly", async function () {
          const GasLimit = await lottery.getCallbackGasLimit();
          assert.equal(
            GasLimit.toString(),
            networkConfig[chainID].callbackGasLimit
          );
        });
        it("Sets the TimeStamp to the current time", async function () {
          const timeStamp = await lottery.getLastTimeStamp();

          const blockNumber = await ethers.provider.getBlockNumber();

          const block = await ethers.provider.getBlock(blockNumber);

          assert.equal(timeStamp.toString(), block.timestamp.toString());
        });
        it("Sets the subscriptionID correctly", async function () {
          const subID = await lottery.getSubscriptionID();

          // Act
          // const txResponse = await vrfCoordinatorV2Mock.createSubscription();
          // const txReceipt = await txResponse.wait(1);
          // let subscriptionId = txReceipt.events[0].args.subId;

          // Assert
          assert.equal(subID.toString(), 1);
        });
      });
      describe("enterLottery", function () {
        it("Reverts if amount is less than entrance fee", async function () {
          await expect(lottery.enterLottery()).to.be.revertedWithCustomError(
            lottery,
            "Lottery__NotEnoughETHEntered"
          );
        });
        it("Records player in the lottery", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          const player = await lottery.getPlayer(0);
          assert.equal(player, deployer);
        });
        it("Emits the Address of the player", async function () {
          await expect(
            lottery.enterLottery({
              value: lotteryEntranceFee,
            })
          ).to.emit(lottery, "LotteryEnter");
        });
        it("Does not allow entrance into lottery when it is connecting", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 1,
          ]);

          await network.provider.send("evm_mine", []);
          // We pretend to be a Chainlink Keeper
          await lottery.performUpkeep([]);
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee })
          ).to.be.revertedWithCustomError(lottery, "Lottery__NotOpen");
        });
      });
      describe("checkUpKeep", function () {
        it("Returns false if players haven't sent ETH", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });
        it("Returns false if lottery state is CONNECTING", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          // We pretend to be a Chainlink Keeper
          await lottery.performUpkeep([]);
          const lotteryState = await lottery.getLotteryState();
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
          assert.equal(lotteryState.toString(), "1");
          assert.equal(upkeepNeeded, false);
        });
        it("Returns false if there is no player", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);

          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
          const Players = await lottery.getPlayers();

          assert.equal(Players.length, 0);
          assert.equal(upkeepNeeded, false);
        });
        it("Returns false if enough time has not elapsed", async function () {
          // await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
          assert(upkeepNeeded);
        });
        it("Returns true if there are players, has ETH, enough time has passed and lottery state is open", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const lotteryState = await lottery.getLotteryState();
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
          assert.equal(lotteryState.toString(), "0");
          assert.equal(upkeepNeeded, true);
        });
      });
      describe("performUpkeep", function () {
        it("Can only run if checkupkeep is true", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const txResponse = await lottery.performUpkeep([]);
          assert(txResponse);
        });
      });
    });
