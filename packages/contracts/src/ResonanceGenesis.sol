// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract ResonanceGenesis is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    struct NodeTraits {
        uint32 frequency;
        uint8 modeN;
        uint8 modeM;
        uint16 nodeDensityBps;
        uint16 lineThicknessBps;
        uint8 rarityTier;
        bool initialized;
    }

    uint256 public immutable maxSupply;
    uint256 public mintPrice;
    string private baseTokenUri;
    uint256 private nextTokenId = 1;

    mapping(uint256 tokenId => NodeTraits traits) private nodeTraits;

    event BaseURIUpdated(string baseURI);
    event MintPriceUpdated(uint256 mintPrice);
    event NodeTraitsSet(uint256 indexed tokenId, NodeTraits traits);
    event NodeMinted(address indexed minter, uint256 indexed tokenId);

    constructor(uint256 _maxSupply, uint256 _mintPrice, string memory _baseURI)
        ERC721("Resonance Genesis", "NODE")
        Ownable(msg.sender)
    {
        require(_maxSupply > 0, "max supply zero");
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        baseTokenUri = _baseURI;
    }

    function mint(uint256 quantity) external payable nonReentrant {
        require(quantity > 0, "quantity zero");
        require(totalSupply() + quantity <= maxSupply, "sold out");
        require(msg.value == mintPrice * quantity, "wrong value");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, nextTokenId);
            emit NodeMinted(msg.sender, nextTokenId);
            nextTokenId++;
        }
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
        emit MintPriceUpdated(_mintPrice);
    }

    function setBaseURI(string calldata _baseURI) external onlyOwner {
        baseTokenUri = _baseURI;
        emit BaseURIUpdated(_baseURI);
    }

    function setNodeTraits(uint256 tokenId, NodeTraits calldata traits) external onlyOwner {
        _setNodeTraits(tokenId, traits);
    }

    function batchSetNodeTraits(uint256[] calldata tokenIds, NodeTraits[] calldata traitsList) external onlyOwner {
        require(tokenIds.length == traitsList.length, "length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _setNodeTraits(tokenIds[i], traitsList[i]);
        }
    }

    function getNodeTraits(uint256 tokenId) external view returns (NodeTraits memory traits) {
        require(tokenId > 0 && tokenId <= maxSupply, "token id out of range");
        traits = nodeTraits[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(baseTokenUri, tokenId.toString(), ".json");
    }

    function withdraw(address payable recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "zero recipient");
        (bool ok,) = recipient.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }

    function _setNodeTraits(uint256 tokenId, NodeTraits calldata traits) private {
        require(tokenId > 0 && tokenId <= maxSupply, "token id out of range");
        require(traits.frequency > 0, "frequency zero");
        require(traits.modeN > 0 && traits.modeM > 0, "mode zero");
        require(traits.rarityTier <= 5, "bad rarity");
        require(traits.initialized, "traits not initialized");
        nodeTraits[tokenId] = traits;
        emit NodeTraitsSet(tokenId, traits);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
