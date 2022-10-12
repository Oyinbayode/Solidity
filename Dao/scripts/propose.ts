import { ethers, getChainId } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  NEW_STORE_VALUE,
  FUNCTION_NAME,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalFile,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import * as fs from "fs";

export async function propose(
  functToCall: string,
  args: any[],
  proposalDescription: string
) {
  const governor = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");

  const chainId = (await getChainId()) as string;

  const encodedFunctionCall = box.interface.encodeFunctionData(
    functToCall,
    args
  );
  console.log(`Proposing ${functToCall} on ${box.address} with args ${args}`);
  console.log(`Proposal Description: \n ${proposalDescription}`);
  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposeReceipt = proposeTx.wait(1);
  if (chainId === "31337") {
    await moveBlocks(VOTING_DELAY + 1);
  }

  const proposeReceiptTx = await proposeReceipt;

  const proposalId = proposeReceiptTx.events[0].args.proposalId;

  let proposals = JSON.parse(fs.readFileSync(proposalFile, "utf8"));

  proposals[chainId!.toString()].push(proposalId.toString());
  fs.writeFileSync(proposalFile, JSON.stringify(proposals));
}
propose(FUNCTION_NAME, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
