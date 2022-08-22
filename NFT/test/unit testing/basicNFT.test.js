// const { assert, expect } = require("chai");
// const { network, deployments, ethers } = require("hardhat");
// const {
//   developmentChains,
//   networkConfig,
// } = require("../../helper-hardhat-config");
// const chainID = network.config.chainId;

// chainID !== 31337
//   ? describe.skip
//   : describe("Basic NFT Unit Tests", () => {
//       let basicNFTFactory, basicNFT;

//       beforeEach(async () => {
//         basicNFTFactory = await ethers.getContractFactory("BasicNFT");
//         basicNFT = await basicNFTFactory.deploy();
//       });

//       describe("constructor", () => {
//         it("Sets the token counter correctly", async () => {
//           const tokenCounter = await basicNFT.getTokenCounter();
//           expect(tokenCounter).to.equal(0);
//         });
//       });
//       describe("mint", () => {
//         it("Mints the NFT and updates Appropriately", async () => {
//           const txResponse = await basicNFT.mintNFT();
//           await txResponse.wait(1);
//           const tokenURI = await basicNFT.tokenURI(0);
//           const tokenCounter = await basicNFT.getTokenCounter();

//           assert.equal(tokenCounter.toString(), "1");
//           assert.equal(tokenURI, await basicNFT.TOKEN_URI());
//         });
//       });
//     });
