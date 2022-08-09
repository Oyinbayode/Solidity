const { ethers, network } = require("hardhat");
const fs = require("fs");
const FRONT_END_ADDRESSES_FILE = "../lottery/constants/contractAddresses.json";
const FRONT_END_ABI_FILE = "../lottery/constants/abi.json";

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    updateContractAddresses();
    updateABI();
  }
};

async function updateABI() {
  // Get the contract address
  const lottery = await ethers.getContract("Lottery");

  // Get Contract ABI
  const abi = lottery.interface.format(ethers.utils.FormatTypes.json);

  // Write ABI into file
  fs.writeFileSync(FRONT_END_ABI_FILE, abi);
}

async function updateContractAddresses() {
  // Get the contract address
  const lottery = await ethers.getContract("Lottery");
  const chainId = network.config.chainId.toString();
  const currentAddress = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8")
  );

  // Check if contract address is already in the file
  if (chainId in currentAddress) {
    if (!currentAddress[chainId].includes(lottery.address)) {
      // Add the contract address to the file
      currentAddress[chainId].push(lottery.address);
    }
  }
  // If the chainId is not in the file, add it
  currentAddress[chainId] = [lottery.address];
  // Write the new contract address to the file
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddress));
}

module.exports.tags = ["all", "frontend"];
