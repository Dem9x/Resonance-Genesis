// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ResonanceGenesis} from "../src/ResonanceGenesis.sol";

contract BatchSetTraits is Script {
    function run() external {
        address nftAddress = vm.envAddress("RESONANCE_GENESIS_ADDRESS");
        require(
            nftAddress.code.length > 0,
            "RESONANCE_GENESIS_ADDRESS has no contract code"
        );

        _assertResonanceGenesis(nftAddress);

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = vm.envOr("TOKEN_ID", uint256(1));

        ResonanceGenesis.NodeTraits[] memory traits = new ResonanceGenesis.NodeTraits[](1);
        traits[0] = ResonanceGenesis.NodeTraits({
            frequency: uint32(vm.envOr("NODE_FREQUENCY", uint256(963))),
            modeN: uint8(vm.envOr("NODE_MODE_N", uint256(6))),
            modeM: uint8(vm.envOr("NODE_MODE_M", uint256(8))),
            nodeDensityBps: uint16(vm.envOr("NODE_DENSITY_BPS", uint256(920))),
            lineThicknessBps: uint16(vm.envOr("NODE_LINE_THICKNESS_BPS", uint256(102))),
            rarityTier: uint8(vm.envOr("NODE_RARITY_TIER", uint256(2))),
            initialized: true
        });

        require(tokenIds.length > 0, "No tokenIds found");
        require(tokenIds.length == traits.length, "Length mismatch");

        vm.startBroadcast();
        ResonanceGenesis(nftAddress).batchSetNodeTraits(tokenIds, traits);
        vm.stopBroadcast();
    }

    function _assertResonanceGenesis(address nftAddress) private view {
        (bool nameOk, bytes memory nameData) = nftAddress.staticcall(
            abi.encodeWithSignature("name()")
        );

        require(
            nameOk && nameData.length > 0,
            "address is not an ERC721 contract"
        );

        string memory collectionName = abi.decode(nameData, (string));

        require(
            keccak256(bytes(collectionName)) ==
                keccak256(bytes("Resonance Genesis")),
            "address is not ResonanceGenesis"
        );

        (bool maxSupplyOk, bytes memory maxSupplyData) = nftAddress.staticcall(
            abi.encodeWithSignature("maxSupply()")
        );

        require(
            maxSupplyOk && maxSupplyData.length == 32,
            "address is missing maxSupply()"
        );

        uint256 maxSupply = abi.decode(maxSupplyData, (uint256));
        require(maxSupply >= 1, "maxSupply is too low");

        (bool traitsReadOk, ) = nftAddress.staticcall(
            abi.encodeWithSignature("getNodeTraits(uint256)", uint256(1))
        );

        require(
            traitsReadOk,
            "deployed ResonanceGenesis is old bytecode; redeploy patched contract"
        );
    }
}
