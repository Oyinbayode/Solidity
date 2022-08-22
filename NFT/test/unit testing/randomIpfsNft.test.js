const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const chainID = network.config.chainId;

developmentChains[0] !== "localhost"
  ? describe.skip
  : describe("Random NFT Unit Tests", () => {
      let RandomIpfsNft,
        RandomIpfsNftFactory,
        vrfCoordinatorV2Mock,
        accounts,
        minter;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        minter = accounts[1];
        await deployments.fixture(["mocks", "random"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        let RandomIpfsNftContract = await ethers.getContract("RandomIpfsNft");
        RandomIpfsNft = RandomIpfsNftContract.connect(minter);
        const two = 2;
      });

      describe("constructor", () => {
        it("Sets the SubscriptionID correctly", async () => {
          const subscriptionID = await RandomIpfsNft.getSubscriptionId();
          expect(subscriptionID.toNumber()).to.equal(1);
        });
        it("Sets the keyHash correctly", async () => {
          const keyHash = await RandomIpfsNft.getKeyHash();
          expect(keyHash).to.equal(
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15"
          );
        });
        it("Sets the callbackGasLimit correctly", async () => {
          const callbackGasLimit = await RandomIpfsNft.getCallbackGasLimit();
          assert.equal(callbackGasLimit, "100000");
        });
        it("Sets the TokenUris correctly", async () => {
          const tokenUris = await RandomIpfsNft.getDogTokenUris(0);
          assert.equal(tokenUris, networkConfig[chainID].dogTokenUris[0]);
        });
        it("Sets the mint fee correctly", async () => {
          const mintFee = await RandomIpfsNft.getMintFee();
          assert.equal(
            mintFee.toString(),
            ethers.utils.parseEther(networkConfig[chainID].mintFee)
          );
        });
        it("Sets owner to the minter", async () => {
          const owner = await RandomIpfsNft.getOwner();
          assert.equal(owner, accounts[0].address);
        });
      });

      describe("requestNFT", () => {
        it("reverts if mint fee is not enough", async () => {
          await expect(
            RandomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            RandomIpfsNft,
            "RandomIpfsNft__NeedMoreEthSent"
          );
        });
        it("Emits the RequestNFT event", async () => {
          const mintFee = await RandomIpfsNft.getMintFee();
          await expect(
            RandomIpfsNft.requestNft({ value: mintFee.toString() })
          ).to.emit(RandomIpfsNft, "NftRequested");
        });
        it("Maps the request id to the minter", async () => {
          const mintFee = await RandomIpfsNft.getMintFee();
          await RandomIpfsNft.requestNft({
            value: mintFee.toString(),
          });

          const requestor = await RandomIpfsNft.getRequestIdToSender(1);
          assert.equal(requestor, minter.address);
        });
      });

      describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async function () {
          await new Promise(async (resolve, reject) => {
            RandomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenUri = await RandomIpfsNft.getDogTokenUris(0);
                const tokenCounter = await RandomIpfsNft.getTokenCounter();
                assert.equal(tokenUri.toString().includes("ipfs://"), true);
                assert.equal(tokenCounter.toString(), "1");
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
            });
            try {
              const fee = await RandomIpfsNft.getMintFee();
              const requestNftResponse = await RandomIpfsNft.requestNft({
                value: fee.toString(),
              });
              const requestNftReceipt = await requestNftResponse.wait(1);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestNftReceipt.events[1].args.requestId,
                RandomIpfsNft.address
              );
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });
        });
      });
    });
