import { proposalFile } from "../helper-hardhat-config";
import * as fs from "fs";
import { ethers, getChainId } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { VOTING_PERIOD } from "../helper-hardhat-config";

const index = 0;

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalFile, "utf8"));
  const proposalId = proposals[await getChainId()][proposalIndex];

  const voteWay = 1;
  const governor = await ethers.getContract("GovernorContract");
  const voteTxResponse = await governor.castVoteWithReason(
    proposalId,
    voteWay,
    "I love this proposal"
  );
  await voteTxResponse.wait(1);
  if ((await getChainId()) === "31337") {
    await moveBlocks(VOTING_PERIOD + 1);
  }
  console.log("Voted");
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
