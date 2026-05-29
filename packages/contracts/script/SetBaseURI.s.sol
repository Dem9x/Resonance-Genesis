// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ResonanceGenesis} from "../src/ResonanceGenesis.sol";

contract SetBaseURI is Script {
    function run() external {
        address nftAddress = vm.envAddress("RESONANCE_GENESIS_ADDRESS");
        string memory metadataCid = vm.envString("METADATA_CID");

        vm.startBroadcast();
        ResonanceGenesis(nftAddress).setBaseURI(string.concat("ipfs://", metadataCid, "/"));
        vm.stopBroadcast();
    }
}
