const { ethers } = require("ethers");

const networkConfig = {
  4: {
    name: "rinkeby",
  },
  31337: {
    name: "localhost",
  },
};

const INITIAL_SUPPLY = ethers.utils.parseEther("100000000");

const developmentChains = ["localhost", "rinkeby"];

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY,
};
