const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const BoxV2 = await deploy("BoxV2", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmaions: network.config.blockConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying BoxV2 contract on Etherscan");
    await verify(BoxV2.address, []);
    log("BoxV2 deployed to:", BoxV2.address);
  }
};
