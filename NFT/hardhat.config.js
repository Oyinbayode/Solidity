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
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: process.env.GOERLI_KEY || "",
      accounts: [process.env.PRIVATE_KEY || ""],
      allowUnlimitedContractSize: true,
    },
    rinkeby: {
      chainId: 4,
      blockConfirmations: 6,
      url: process.env.RINKEBY_URL || "",
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.9" },
      { version: "0.6.12" },
      { version: "0.4.19" },
      { version: "0.8.10" },
      { version: "0.6.6" },
      { version: "0.6.0" },
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
