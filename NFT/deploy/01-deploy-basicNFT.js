const { network } = require("hardhat");
const { developmetChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const chainID = network.config.chainId;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("------------------------------------------------------");
  const args = [];
  const basicNFT = await deploy("BasicNFT", {
    from: deployer,
    args,
    logs: true,

    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Token deployed at ${basicNFT.address}`);

  if (chainID === 5 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying NFT on Etherscan...");
    await verify(basicNFT.address, args);
  }
};

module.exports.tag = ["all", "main", "basic"];
