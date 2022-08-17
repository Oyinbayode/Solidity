const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

async function getWeth() {
  const { deployer } = await getNamedAccounts();
  // Call the "deposit" function of the WETH contract

  // abi, contract address
  // CA: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
  const iWeth = await ethers.getContractAt(
    "IWeth",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    deployer
  );
  const tx = await iWeth.deposit({ value: ethers.utils.parseEther("0.05") });
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(`WETH balance: ${wethBalance}`);
}

module.exports = { getWeth };
