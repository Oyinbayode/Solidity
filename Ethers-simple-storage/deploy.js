const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const bytecode = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log("Deploying contract...");
  const contract = await contractFactory.deploy();
  await contract.deployTransaction.wait(1);

  // GEt Number
  const currentFavoriteNumber = await contract.retrieve();
  console.log("Current favorite number:", currentFavoriteNumber.toString());

  // Update Number
  const transactionResponse = await contract.store("42");
  await transactionResponse.wait(1);
  const newFavoriteNumber = await contract.retrieve();
  console.log("New favorite number:", newFavoriteNumber.toString());
};

main();
