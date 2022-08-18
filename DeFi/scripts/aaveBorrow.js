const { ethers, getNamedAccounts } = require("hardhat");
const { getWeth } = require("./getWeth");

async function main() {
  // the protocol treats everything as an ERC20 token
  await getWeth();
  const { deployer } = await getNamedAccounts();

  // Lending Pool Address Provider (0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5)
  const lendingPool = await getLendingPool(deployer);
  console.log(`Lending Pool Address: ${lendingPool.address}`);
}

async function getLendingPool(account) {
  const lendingPoolAddressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
