const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const chainID = network.config.chainId;

chainID === 31337
  ? describe.skip
  : describe("Lottery Staging Tests", function () {
      let lottery, lotteryEntranceFee, deployer;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        lottery = await ethers.getContract("Lottery", deployer);
        lotteryEntranceFee = await lottery.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          // enter the lottery
          console.log("Setting up test...");
          const startingTimeStamp = await lottery.getLastTimeStamp();
          const accounts = await ethers.getSigners();

          console.log("Setting up Listener...");
          await new Promise(async (resolve, reject) => {
            // setup listener before we enter the lottery
            // Just in case the blockchain moves REALLY fast
            lottery.once("WinnerPreviouslyPicked", async () => {
              console.log("WinnerPicked event fired!");
              const winnerStartingBalance = await accounts[0].getBalance();
              try {
                // add our asserts here
                const recentWinner = await lottery.getRecentWinner();
                const lotteryState = await lottery.getLotteryState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await lottery.getLastTimeStamp();

                // await expect(lottery.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(lotteryState, 0);
                // assert.equal(
                //   winnerStartingBalance.toString(),
                //   winnerEndingBalance.add(lotteryEntranceFee).toString()
                // );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });
            // Then entering the lottery
            console.log("Entering lottery...");
            await lottery.enterLottery({
              value: lotteryEntranceFee,
            });

            console.log("Ok, time to wait...");

            // and this code WONT complete until our listener has finished listening!
          });
        });
      });
    });
