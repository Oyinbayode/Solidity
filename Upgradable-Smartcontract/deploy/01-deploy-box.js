const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("-------------");
  log("Deploying Box contract with the account:", deployer);

  const Box = await deploy("Box", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmaions: network.config.blockConfirmations,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: {
        name: "BoxProxyAdmin",
        artifact: "BoxProxyAdmin",
      },
    },
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying Box contract on Etherscan");
    await verify(Box.address, []);
    log("Box deployed to:", Box.address);
  }
};
