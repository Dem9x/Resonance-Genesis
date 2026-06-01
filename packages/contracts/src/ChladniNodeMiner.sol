// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IResonanceGenesis is IERC721 {
    struct NodeTraits {
        uint32 frequency;
        uint8 modeN;
        uint8 modeM;
        uint16 nodeDensityBps;
        uint16 lineThicknessBps;
        uint8 rarityTier;
        bool initialized;
    }

    function getNodeTraits(uint256 tokenId) external view returns (NodeTraits memory traits);
}

interface IResonanceEnergy {
    function mint(address to, uint256 amount) external;
}

contract ChladniNodeMiner is IERC721Receiver, Ownable, ReentrancyGuard {
    struct StakeInfo {
        address owner;
        uint64 stakedAt;
        uint64 lastClaimAt;
        uint256 accumulatedEnergy;
    }

    uint256 public constant ENERGY_SCALE = 1 days;
    IResonanceGenesis public immutable resonanceGenesis;
    IResonanceEnergy public immutable resonanceEnergy;

    mapping(uint256 tokenId => StakeInfo info) public stakes;
    mapping(address user => uint256[] tokenIds) private stakedTokensByOwner;
    mapping(uint256 tokenId => uint256 indexPlusOne) private stakedTokenIndex;

    event NodeStaked(address indexed user, uint256 indexed tokenId);
    event NodeUnstaked(address indexed user, uint256 indexed tokenId);
    event EnergyClaimed(address indexed user, uint256 indexed tokenId, uint256 amount);

    constructor(address nftAddress, address reAddress) Ownable(msg.sender) {
        require(nftAddress != address(0), "zero nft");
        require(reAddress != address(0), "zero re");
        resonanceGenesis = IResonanceGenesis(nftAddress);
        resonanceEnergy = IResonanceEnergy(reAddress);
    }

    function stake(uint256 tokenId) external nonReentrant {
        require(resonanceGenesis.ownerOf(tokenId) == msg.sender, "not token owner");
        require(stakes[tokenId].owner == address(0), "already staked");

        resonanceGenesis.safeTransferFrom(msg.sender, address(this), tokenId);
        stakes[tokenId] = StakeInfo({
            owner: msg.sender,
            stakedAt: uint64(block.timestamp),
            lastClaimAt: uint64(block.timestamp),
            accumulatedEnergy: 0
        });
        stakedTokensByOwner[msg.sender].push(tokenId);
        stakedTokenIndex[tokenId] = stakedTokensByOwner[msg.sender].length;

        emit NodeStaked(msg.sender, tokenId);
    }

    function unstake(uint256 tokenId) external nonReentrant {
        StakeInfo storage info = stakes[tokenId];
        require(info.owner == msg.sender, "not staker");

        uint256 claimAmount = pendingEnergy(tokenId);
        if (claimAmount > 0) {
            info.accumulatedEnergy = 0;
            info.lastClaimAt = uint64(block.timestamp);
            resonanceEnergy.mint(msg.sender, claimAmount);
            emit EnergyClaimed(msg.sender, tokenId, claimAmount);
        }

        _removeStakedToken(msg.sender, tokenId);
        delete stakes[tokenId];
        resonanceGenesis.safeTransferFrom(address(this), msg.sender, tokenId);

        emit NodeUnstaked(msg.sender, tokenId);
    }

    function claim(uint256 tokenId) external nonReentrant returns (uint256 amount) {
        StakeInfo storage info = stakes[tokenId];
        require(info.owner == msg.sender, "not staker");
        amount = pendingEnergy(tokenId);
        info.accumulatedEnergy = 0;
        info.lastClaimAt = uint64(block.timestamp);
        if (amount > 0) {
            resonanceEnergy.mint(msg.sender, amount);
        }
        emit EnergyClaimed(msg.sender, tokenId, amount);
    }

    function pendingEnergy(uint256 tokenId) public view returns (uint256) {
        StakeInfo memory info = stakes[tokenId];
        if (info.owner == address(0)) {
            return 0;
        }
        uint256 elapsed = block.timestamp - info.lastClaimAt;
        return info.accumulatedEnergy + ((hashrateOf(tokenId) * elapsed) / ENERGY_SCALE);
    }

    function hashrateOf(uint256 tokenId) public view returns (uint256) {
        IResonanceGenesis.NodeTraits memory traits = _traitsOrFallback(tokenId);
        uint256 frequencyWeight = _sqrt(uint256(traits.frequency)) * 100;
        uint256 modeDelta = traits.modeN > traits.modeM ? traits.modeN - traits.modeM : traits.modeM - traits.modeN;
        uint256 modeComplexity = (uint256(traits.modeN) * uint256(traits.modeM)) + (modeDelta * 3);
        uint256 symmetryBonus = modeDelta <= 1 ? 500 : (modeDelta <= 3 ? 250 : 0);

        // Integer approximation of Chladni complexity:
        // higher frequency raises standing-wave density, mode interaction raises nodal crossings,
        // node density and line thickness proxy the sand-field energy required to keep the pattern coherent.
        uint256 baseHashrate = frequencyWeight + (modeComplexity * 40) + (uint256(traits.nodeDensityBps) * 3)
            + (uint256(traits.lineThicknessBps) * 2) + symmetryBonus;

        return (baseHashrate * _rarityMultiplier(traits.rarityTier)) / 100;
    }

    function miningPowerOf(uint256 tokenId) external view returns (uint256) {
        return hashrateOf(tokenId);
    }

    function stakedOwner(uint256 tokenId) external view returns (address) {
        return stakes[tokenId].owner;
    }

    function isStaked(uint256 tokenId) external view returns (bool) {
        return stakes[tokenId].owner != address(0);
    }

    function getStakedTokens(address user) external view returns (uint256[] memory) {
        return stakedTokensByOwner[user];
    }

    function onERC721Received(address, address, uint256, bytes calldata) external view returns (bytes4) {
        require(msg.sender == address(resonanceGenesis), "unsupported nft");
        return IERC721Receiver.onERC721Received.selector;
    }

    function _traitsOrFallback(uint256 tokenId) private view returns (IResonanceGenesis.NodeTraits memory traits) {
        traits = resonanceGenesis.getNodeTraits(tokenId);
        if (traits.initialized) {
            return traits;
        }

        // Fallback is deterministic and tokenId-derived only for testnet/preview tokens before traits are finalized.
        uint8 modeN = uint8(2 + (tokenId % 8));
        uint8 modeM = uint8(3 + ((tokenId * 3) % 8));
        return IResonanceGenesis.NodeTraits({
            frequency: uint32(174 + ((tokenId * 73) % 852)),
            modeN: modeN,
            modeM: modeM,
            nodeDensityBps: uint16(700 + ((tokenId * 31) % 700)),
            lineThicknessBps: uint16(90 + ((tokenId * 7) % 150)),
            // casting to uint8 is safe because tokenId % 6 is always in [0, 5].
            // forge-lint: disable-next-line(unsafe-typecast)
            rarityTier: uint8(tokenId % 6),
            initialized: true
        });
    }

    function _rarityMultiplier(uint8 rarityTier) private pure returns (uint256) {
        if (rarityTier == 1) return 115;
        if (rarityTier == 2) return 135;
        if (rarityTier == 3) return 165;
        if (rarityTier == 4) return 210;
        if (rarityTier == 5) return 280;
        return 100;
    }

    function _removeStakedToken(address user, uint256 tokenId) private {
        uint256 index = stakedTokenIndex[tokenId];
        require(index != 0, "not indexed");

        uint256[] storage tokens = stakedTokensByOwner[user];
        uint256 arrayIndex = index - 1;
        uint256 lastToken = tokens[tokens.length - 1];

        if (lastToken != tokenId) {
            tokens[arrayIndex] = lastToken;
            stakedTokenIndex[lastToken] = index;
        }

        tokens.pop();
        delete stakedTokenIndex[tokenId];
    }

    function _sqrt(uint256 x) private pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
