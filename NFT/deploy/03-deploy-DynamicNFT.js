const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");
const chainId = network.config.chainId;
const args = require("../argsDynamic");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let ethUsdPriceFeedAddress;

  if (chainId === 31337) {
    const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  log("----------------------------------------------------");

  // const lowSVG = await fs.readFileSync("./images/dynamic/frown.svg", {
  //   encoding: "utf8",
  // });
  // const highSVG = await fs.readFileSync("./images/dynamic/happy.svg", {
  //   encoding: "utf8",
  // });
  // let args = [ethUsdPriceFeedAddress, lowSVG, highSVG];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    contract: "DynamicSvgNft",
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("me");

  if (chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying DynamicSvgNft");
    await verify(dynamicSvgNft.address, args);
  }
};

module.exports.tags = ["all", "dynamic", "main"];
