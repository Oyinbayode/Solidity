const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, logs } = deployments;
  const { deployer } = await getNamedAccounts();
  let VRFCoordinatorV2Address;
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    const VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );

    VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    log("----------------------------------------------------");
  } else {
    VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinator;
  }
  log("----------------------------------------------------");

  const entranceFee = networkConfig[chainId].entranceFee;

  const args = [VRFCoordinatorV2Address, entranceFee];

  const Lottery = await deploy("Lottery", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};
