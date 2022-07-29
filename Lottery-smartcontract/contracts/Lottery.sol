// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

error Lottery__NotEnoughETHEntered();
error Lottery__TransferFailed();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);

/** @title A Simple Lottery Contract
 * @author Oyinbayode Akinleye
 * @notice This contract is a simple lottery contract that selects a winner without prejudice or bias.
 * @dev This contract implements Chainlink VRF V2 and Chainlink Keepers.
 */

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Types */
    enum LotteryState {
        OPEN,
        CONNECTING
    }
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    /* Lottery Variables */
    address private s_recentWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    /* Events */
    event LotteryEnter(address indexed player);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPreviouslyPicked(address indexed winner);

    /* Constructor */
    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    /* Functions */

    // Function to enter lottery
    function enterLottery() public payable {
        if (msg.value < i_entranceFee) {
            revert Lottery__NotEnoughETHEntered();
        }
        if (s_lotteryState != LotteryState.OPEN) {
            revert Lottery__NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit LotteryEnter(msg.sender);
    }

    // Chainlink Keeper
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = s_lotteryState == LotteryState.OPEN;
        bool timeElapsed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = isOpen && timeElapsed && hasPlayers && hasBalance;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        // Request the random number from the VRF consumer
        // Once we get it, we can use it to determine the winner
        // 2 transactions: 1 to request the random number, 1 to determine the winner
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_lotteryState)
            );
        }
        s_lotteryState = LotteryState.CONNECTING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedLotteryWinner(requestId);
    }

    // Function to fulfill random number request
    function fulfillRandomWords(uint256, uint256[] memory randomWords)
        internal
        override
    {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_lotteryState = LotteryState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Lottery__TransferFailed();
        }
        emit WinnerPreviouslyPicked(recentWinner);
    }

    /* View / Pure Functions */

    // getter for the entrance fee
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    // Get Player
    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    // Get Players
    function getPlayers() public view returns (address payable[] memory) {
        return s_players;
    }

    // Get Recent Winner
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    // Get Raffle State
    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    // Get Last Time Stamp
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    // Get Interval
    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    // Get Number of words
    function getNumWords() public pure returns (uint32) {
        return NUM_WORDS;
    }

    // Get Number of Players
    function getNumPlayers() public view returns (uint256) {
        return s_players.length;
    }

    // Get Request Confirmations
    function getRequestConfirmations() public pure returns (uint16) {
        return REQUEST_CONFIRMATIONS;
    }

    // GEt VRF Coordinator address
    function getVRFCoordinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }

    // Get Key Hash
    function getKeyHash() public view returns (bytes32) {
        return i_keyHash;
    }

    // Get Subscription ID
    function getSubscriptionID() public view returns (uint64) {
        return i_subscriptionId;
    }

    function getCallbackGasLimit() public view returns (uint32) {
        return i_callbackGasLimit;
    }
}
