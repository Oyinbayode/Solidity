const { networkConfig } = require("./helper-hardhat-config");
const { network } = require("hardhat");

// deploy/00_deploy_my_contract.js
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;

  // Mock Contracts

  const FundMe = await deploy("FundMe", {
    from: deployer,
    args: ["Hello"], // put price feed address here
    log: true,
  });
};
module.exports.tags = ["MyContract"];
