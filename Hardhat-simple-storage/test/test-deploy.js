const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("simpleStorage", function () {
  let SimpleStorageFactory, simpleStorage;

  beforeEach(async function () {
    SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorageFactory.deploy();
  });
  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve();
    assert.equal(currentValue.toString(), "0");
  });
  it("Should update the favorite number", async function () {
    const transactionResponse = await simpleStorage.store(42);
    await transactionResponse.wait(1);
    const newValue = await simpleStorage.retrieve();
    assert.equal(newValue.toString(), "42");
  });
});
