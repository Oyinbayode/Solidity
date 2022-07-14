const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

const main = async () => {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

  const encryptedJSONKey = await wallet.encrypt(
    process.env.PASSWORD,
    process.env.PRIVATE_KEY
  );

  console.log("encryptedJSONKey:", encryptedJSONKey);
  fs.writeFileSync("./encryptedJSONKey.json", encryptedJSONKey);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
