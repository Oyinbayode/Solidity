// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    // Events
    event createdNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG", "DSN") {
        s_tokenCounter = 0;
        i_lowImageURI = svgToURI(lowSvg);
        i_highImageURI = svgToURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // SVG to URI
    function svgToURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    // Mint Function
    function mintNft(int256 highValue) public payable {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter++;
        _safeMint(msg.sender, s_tokenCounter);

        emit createdNFT(s_tokenCounter, highValue);
    }

    // Base URI Function
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "URI Query for non-existent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = i_lowImageURI;

        if (price > s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    // getters

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getTokenIdToHighValue(uint256 tokenId)
        public
        view
        returns (int256)
    {
        return s_tokenIdToHighValue[tokenId];
    }

    function getLowImageURI() public view returns (string memory) {
        return i_lowImageURI;
    }

    function getHighImageURI() public view returns (string memory) {
        return i_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getBase64EncodedSvgPrefix() public pure returns (string memory) {
        return base64EncodedSvgPrefix;
    }

    function getBaseURI() public pure returns (string memory) {
        return _baseURI();
    }

    function getSvgToURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        return svgToURI(svg);
    }
}
