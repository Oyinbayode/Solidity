import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../utils/verify";
import { ethers } from "hardhat";

const deployBox: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network, getChainId } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log(`Deploying Box on ${network.name}...`);
  const box = await deploy("Box", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1,
  });
  const timeLock = await ethers.getContract("TimeLock");
  const boxContract = await ethers.getContractAt("Box", box.address);
  const tx = await boxContract.transferOwnership(timeLock.address);
  await tx.wait(1);
  log(`Box deployed at ${box.address}`);

  if (chainId === "5" && process.env.ETHERSCAN_API_KEY) {
    log("Verifying Box contract on Etherscan");
    await verify(hre, box.address, []);
    log("Box deployed to:", box.address);
  }
};

export default deployBox;
