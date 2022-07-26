const { assert } = require("chai");
const { deployments, ethers } = require("hardhat");

const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", async function () {
      let lottery, vrfCoordinatorV2Mock;

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
        it("Initializes the Lottery correctly", async function () {
          const lotteryState = await lottery.getLotteryState();
          const interval = await lottery.getInterval();

          assert.equal(interval.toString(), 30);
          assert.equal(lotteryState.toString(), "0");
        });
      });
    });
