const { getNamedAccounts, deployments, network } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const chainID = network.config.chainId;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const Token = await deploy("Token", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    logs: true,

    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Token deployed at ${Token.address}`);

  if (chainID === 4 && process.env.ETHERSCAN_API_KEY) {
    await verify(Token.address, [INITIAL_SUPPLY]);
  }
};

module.exports.tag = ["all", "token"];
