import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../utils/verify";
import { developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployGovernanceToken: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, network, getChainId } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  log(`Deploying Governance Token on ${network.name}...`);
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1,
  });
  log(`Governance Token deployed at ${governanceToken.address}`);

  await delegate(governanceToken.address, deployer);
  log(`Delegated!`);

  if (chainId === "5" && process.env.ETHERSCAN_API_KEY) {
    log("Verifying GovernanceToken contract on Etherscan");
    await verify(hre, governanceToken.address, []);
    log("Box deployed to:", governanceToken.address);
  }
};

const delegate = async (
  governanceTokenAddress: string,
  delegatedAccount: string
) => {
  const governanceTokenContract = await ethers.getContractAt(
    "GovernanceToken",
    governanceTokenAddress
  );
  const tx = await governanceTokenContract.delegate(delegatedAccount);
  await tx.wait(1);
  console.log(
    `Checkpoint ${await governanceTokenContract.numCheckpoints(
      delegatedAccount
    )}`
  );
};

export default deployGovernanceToken;
