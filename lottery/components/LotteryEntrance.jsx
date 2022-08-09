import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);

  // State
  const [entranceFee, setEntranceFee] = useState(0);

  const lotteryAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const { runContractFunction: enterLottery } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[chainId][0],
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  useEffect(() => {
    if (typeof browser === "undefined") {
      var browser = chrome;
    }
    if (isWeb3Enabled) {
      async function updateUI() {
        const entranceFeeFromCall = await getEntranceFee();
        setEntranceFee(entranceFeeFromCall.toString());
      }
      updateUI();
    }
  }, [isWeb3Enabled, getEntranceFee, entranceFee]);

  return <div>{ethers.utils.formatUnits(entranceFee, "ether")}</div>;
}
