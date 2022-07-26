const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let VRFCoordinatorV2Address, subscriptionId;
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    const VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );

    VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    const txResponse = await VRFCoordinatorV2Mock.createSubscription();
    const txReceipt = await txResponse.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;

    // Fund the Subscription
    await VRFCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      ethers.utils.parseEther("2").toString()
    );
    log("----------------------------------------------------");
  } else {
    VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinator;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  log("----------------------------------------------------");

  const entranceFee = networkConfig[chainId].entranceFee;
  const keyHash = networkConfig[chainId].keyHash;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const interval = networkConfig[chainId].interval;

  const args = [
    VRFCoordinatorV2Address,
    entranceFee,
    keyHash,
    subscriptionId,
    callbackGasLimit,
    interval,
  ];

  const Lottery = await deploy("Lottery", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Lottery deployed at ${Lottery.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying contract on Etherscan");
    await verify(Lottery.address, args);
  }
};

module.exports.tags = ["all", "Lottery"];
