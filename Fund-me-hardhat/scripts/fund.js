const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding.....", fundMe.address);
  const txResponse = await fundMe.fund({
    value: ethers.utils.parseEther("1"),
  });
  await txResponse.wait(1);
  console.log("Funded.....", fundMe.address);

  const getBalance = await fundMe.provider.getBalance(fundMe.address);
  console.log("Balance.....", getBalance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
