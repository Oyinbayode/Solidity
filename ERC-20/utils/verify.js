const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguement: args,
      contract: "contracts/ManualToken.sol:Token",
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.log("Error: ", e);
    }
  }
};

module.exports = { verify };
