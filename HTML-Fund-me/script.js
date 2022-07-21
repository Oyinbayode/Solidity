import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("getBalance");
const formID = document.getElementById("ethAmount");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Connected");
    connectButton.innerHTML = "Connected!";
  } else {
    console.log("MetaMask Absent ");
    connectButton.innerHTML = "Install Metamask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    // Provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
    alert(
      `The Current Amount Raised is ${ethers.utils.formatEther(balance)}ETH`
    );
  }
}

// Fund
async function fund(ethAmount) {
  ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    console.log("clicked");
    // Provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Signer / Wallet or someone with gas
    const signer = provider.getSigner();
    console.log(signer);
    // Contract that we are interacting with
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount.toString()),
      });
      const txReceipt = await txResponse.wait(1);
      console.log(txReceipt);
      await listenForTransactionMine(txResponse, provider);
      console.log("Funded");
    } catch (error) {
      console.log(error);
    }

    // ^ ABI and Address
  }
}

function listenForTransactionMine(txResponse, provider) {
  console.log(`Mining txHash ${txResponse.hash}`);

  // Listen for the transaction to be finished
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log(`Completed with ${txReceipt.confirmations} confirmations`);
      resolve();
      formID.value = "";
    });
  });
}

// Withdraw
