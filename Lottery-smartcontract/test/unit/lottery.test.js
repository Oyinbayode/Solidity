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
        // it("Returns false if enough time has not elapsed", async function () {
        //   await lottery.enterLottery({ value: lotteryEntranceFee });
        //   await network.provider.send("evm_increaseTime", [
        //     interval.toNumber() - 1,
        //   ]);
        //   await network.provider.request({
        //     method: "evm_mine",
        //     params: [],
        //   });
        //   const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
        //   assert(!upkeepNeeded);
        // });
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
        it("Reverts when checkUpkeep is false", async function () {
          await expect(lottery.performUpkeep([])).to.be.revertedWithCustomError(
            lottery,
            "Lottery__UpkeepNotNeeded"
          );
        });
        it("Updates the Lottery State, emits an event and calls the vrf coordinator", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const txResponse = await lottery.performUpkeep([]);
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.events[1].args.requestId;
          const lotteryState = await lottery.getLotteryState();
          assert.equal(lotteryState.toString(), "1");
          assert(requestId.toNumber() > 0);
        });
      });
      describe("fulfillRandomWords", function () {
        beforeEach(async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
        });
        it("Can only be called after PerformUpkeep", async function () {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, lottery.address)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, lottery.address)
          ).to.be.revertedWith("nonexistent request");
        });
        it("Picks a winner", async function (done) {
          const additionalEntrants = 3;
          const startingAccountIndex = 1; // deployer is 0
          const accounts = await ethers.getSigners();
          for (let i = 0; i < startingAccountIndex + additionalEntrants; i++) {
            const connectedLotteryAccount = lottery.connect(accounts[i]);
            await connectedLotteryAccount.enterLottery({
              value: lotteryEntranceFee,
            });
          }
          const startingTimeStamp = await lottery.getLastTimeStamp();

          // Perform Upkeep (Mock being chainlink keeper

          // Mock being the chainlink VRF

          // We will have to wait for the fulfillRandomWords to be called

          await new Promise(async (resolve, reject) => {
            lottery.once("WinnerPicked", async () => {
              console.log("Found WinnerPicked event");
              try {
                const recentWinner = await lottery.getRecentWinner();
                const lotteryState = await lottery.getLotteryState();
                const lastTimeStamp = await lottery.getLastTimeStamp();
                const numPlayers = await lottery.getNumPlayers();
                const winnerEndingBalance = await accounts[1].getBalance();

                assert.equal(numPlayers.toString(), "0");
                assert.equal(lotteryState.toString(), "0");
                assert(lastTimeStamp > startingTimeStamp);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance
                    .add(lotteryEntranceFee.mul(additionalEntrants))
                    .add(lotteryEntranceFee)
                    .toString()
                );
              } catch (e) {
                reject(e);
              }

              resolve();
            });
            const tx = await lottery.performUpkeep([]);
            const txReceipt = await tx.wait(1);
            const winnerStartingBalance = await accounts[2].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              lottery.address
            );
          });
        });
      });
    });
