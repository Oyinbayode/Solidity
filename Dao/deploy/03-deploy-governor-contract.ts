import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../utils/verify";
import {
  VOTING_DELAY,
  VOTING_PERIOD,
  QUORUM_PERCENTAGE,
} from "../helper-hardhat-config";

const deployGovernor: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, network, getChainId } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const governanceToken = await get("GovernanceToken");
  const timeLock = await get("TimeLock");

  log(`Deploying GovernorContract on ${network.name}...`);
  const governor = await deploy("GovernorContract", {
    from: deployer,
    log: true,
    args: [
      governanceToken.address,
      timeLock.address,
      VOTING_DELAY,
      VOTING_PERIOD,
      QUORUM_PERCENTAGE,
    ],
    waitConfirmations: 1,
  });
  log(`Governor deployed at ${governor.address}`);

  if (chainId === "5" && process.env.ETHERSCAN_API_KEY) {
    log("Verifying Governor contract on Etherscan");
    await verify(hre, governor.address, []);
    log("Box deployed to:", governor.address);
  }
};

export default deployGovernor;
