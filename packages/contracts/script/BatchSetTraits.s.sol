// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ResonanceGenesis} from "../src/ResonanceGenesis.sol";

contract BatchSetTraits is Script {
    function run() external {
        address nftAddress = vm.envAddress("RESONANCE_GENESIS_ADDRESS");

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;

        ResonanceGenesis.NodeTraits[] memory traits = new ResonanceGenesis.NodeTraits[](1);
        traits[0] = ResonanceGenesis.NodeTraits({
            frequency: 963,
            modeN: 6,
            modeM: 8,
            nodeDensityBps: 920,
            lineThicknessBps: 102,
            rarityTier: 2,
            initialized: true
        });

        vm.startBroadcast();
        ResonanceGenesis(nftAddress).batchSetNodeTraits(tokenIds, traits);
        vm.stopBroadcast();
    }
}
