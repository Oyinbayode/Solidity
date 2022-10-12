import { network } from "hardhat";

export async function moveBlocks(blocks: number) {
  console.log("Moving Blocks...");
  for (let i = 0; i < blocks; i++) {
    await network.provider.send("evm_mine", []);
  }
}
