require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
      forking: {
        url: process.env.MAINNET_RPC_URL,
      },
    },
    georli: {
      chainId: 5,
      blockConfirmations: 6,
      url: process.env.GEORLI_URL || "",
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.9" },
      { version: "0.6.12" },
      { version: "0.4.19" },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-reporter.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH",
  },
  mocha: {
    timeout: 300000,
  },
};
