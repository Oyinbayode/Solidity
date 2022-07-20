const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding.....", fundMe.address);
  const txResponse = await fundMe.withdraw({
    value: ethers.utils.parseEther("4"),
  });
  await txResponse.wait(1);
  console.log("withdrawing.....", fundMe.address);

  const getBalance = await fundMe.provider.getBalance(fundMe.address);
  console.log("Balance.....", getBalance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
