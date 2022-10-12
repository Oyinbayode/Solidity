import { HardhatRuntimeEnvironment } from "hardhat/types";

const verify = async (
  hre: HardhatRuntimeEnvironment,
  contractAddress: string,
  args: any[]
) => {
  const { run } = hre;

  console.log(`Verifying ${contractAddress}...`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log("Error:", e);
    }
  }
};

export default verify;
