import { useCallback, useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";
import { Bell } from "@web3uikit/icons";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);

  // State
  const [entranceFee, setEntranceFee] = useState(0);
  const [players, setPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");

  const dispatch = useNotification();

  const lotteryAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const {
    runContractFunction: enterLottery,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
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

  const { runContractFunction: getNumPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getNumPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const callbackUI = useCallback(() => {
    async function updateUI() {
      const entranceFeeFromCall = await getEntranceFee();
      const getNumPlayersFromCall = await getNumPlayers();
      const getRecentWinnerFromCall = await getRecentWinner();

      setEntranceFee(entranceFeeFromCall.toString());
      setPlayers(getNumPlayersFromCall.toString());
      setRecentWinner(getRecentWinnerFromCall);
    }
    updateUI();
  }, [getEntranceFee, getNumPlayers, getRecentWinner]);

  useEffect(() => {
    if (typeof browser === "undefined") {
      var browser = chrome;
    }
    if (isWeb3Enabled) {
      callbackUI();

      async () => {
        setRecentWinner((await getRecentWinner()).tostring());
      };
    }
  }, [isWeb3Enabled, callbackUI, getRecentWinner]);

  const handleNewNotification = function () {
    dispatch({
      type: "success",
      message: "You have been entered into the lottery!",
      title: "Congratulations!",
      position: "topR",
      icon: <Bell />,
    });
  };

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotification(tx);
    callbackUI();
  };

  return (
    <div className="p-5 py-14 flex flex-col items-center h-screen">
      {" "}
      {lotteryAddress ? (
        <div className="py-8">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300 disabled:text-gray-700"
            onClick={async function () {
              await enterLottery({
                onSuccess: handleSuccess,
                onError: (err) => console.log(err),
              });
            }}
            disabled={isFetching || isLoading}
          >
            {isFetching || isLoading ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full  "></div>
            ) : (
              "Enter Lottery"
            )}
          </button>
        </div>
      ) : (
        <></>
      )}
      {isWeb3Enabled && (
        <div>
          <p className="text-white font-bold py-3 ">
            Entrance Fee is: {ethers.utils.formatUnits(entranceFee, "ether")}ETH{" "}
          </p>
          <p className="text-white font-bold py-3 ">
            Number of players: {players}
          </p>
          <p className="text-white font-bold py-3 ">
            Recent winner: {recentWinner}
          </p>
        </div>
      )}
    </div>
  );
}
