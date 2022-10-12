import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MIN_DELAY } from "../helper-hardhat-config";
import verify from "../utils/verify";
import { getChainId } from "hardhat";

const deployTimeLock: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  log(`Deploying TimeLock on ${network.name}...`);
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    log: true,
    args: [MIN_DELAY, [], []],
    waitConfirmations: 1,
  });
  log(`TimeLock deployed at ${timeLock.address}`);

  if (chainId === "5" && process.env.ETHERSCAN_API_KEY) {
    log("Verifying GovernanceToken contract on Etherscan");
    await verify(hre, timeLock.address, []);
    log("Box deployed to:", timeLock.address);
  }
};

export default deployTimeLock;
