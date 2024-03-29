const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokeUriMetadata,
} = require("../utils/uploadToPinata");
const chainId = network.config.chainId;

const FUND_AMOUNT = "1000000000000000000000";
const imagesLocation = "./images/random/";
let tokenUris = networkConfig[chainId].dogTokenUris;

// const imageUris = [
//     "ipfs://QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8",
//     "ipfs://QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
//     "ipfs://QmUPjADFGEKmfohdTaNcWhp7VGk26h5jXDA7v3VtTnTLcW",
// ]

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

  // if (process.env.UPLOAD_TO_PINATA == "true") {
  //   tokenUris = await handleTokenUris();
  // }

  if (chainId === 31337) {
    // create VRFV2 Subscription
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");

    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;

    // Fund the subscription
    // Our mock makes it so we don't actually have to worry about sending fund
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);

    // Add Consumer
    vrfCoordinatorV2Mock.addConsumer(subscriptionId, vrfCoordinatorV2Address);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("----------------------------------------------------");
  const arguments = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId].keyHash,
    ethers.utils.parseEther(networkConfig[chainId]["mintFee"]),
    networkConfig[chainId].callbackGasLimit,
    tokenUris,
  ];
  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("----------------------------------------------------");
  if (chainId === 31337) {
    await vrfCoordinatorV2Mock.addConsumer(
      subscriptionId,
      randomIpfsNft.address
    );
  }

  // Verify the deployment
  if (chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    await verify(randomIpfsNft.address, arguments);
  }
};

async function handleTokenUris() {
  // Check out https://github.com/PatrickAlphaC/nft-mix for a pythonic version of uploading
  // to the raw IPFS-daemon from https://docs.ipfs.io/how-to/command-line-quick-start/
  // You could also look at pinata https://www.pinata.cloud/
  tokenUris = [];
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokeUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs uploaded! They are:");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "random", "main"];
