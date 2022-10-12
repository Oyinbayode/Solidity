import { network } from "hardhat";

export async function moveTime(seconds: number) {
  console.log("Moving Time...");
  await network.provider.send("evm_increaseTime", [seconds]);
  console.log(`Moved forward ${seconds} seconds`);
}
