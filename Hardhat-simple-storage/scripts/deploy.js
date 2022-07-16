const { ethers, run, network } = require("hardhat");

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract........");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log("Contract deployed at:", simpleStorage.address);
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log("Current value:", currentValue.toString());

  // Update Current Value
  const transactionResponse = await simpleStorage.store(42);
  await transactionResponse.wait(1);
  const newValue = await simpleStorage.retrieve();
  console.log("New value:", newValue.toString());
}

async function verify(contractAddress, args) {
  console.log("Verifying contract........");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArgs: args,
    });
  } catch (e) {
    e.message.toLowerCase().includes("already verified")
      ? console.log("Contract already verified")
      : console.log(e);
  }
}

main()
  .then(() => process.exit(0))
  .then((err) => {
    console.log(err);
    process.exit(1);
  });
