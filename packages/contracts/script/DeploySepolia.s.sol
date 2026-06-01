// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ResonanceGenesis} from "../src/ResonanceGenesis.sol";
import {ChladniNodeMiner} from "../src/ChladniNodeMiner.sol";
import {ResonanceEnergy} from "../src/ResonanceEnergy.sol";

contract DeploySepolia is Script {
    function run() external returns (ResonanceGenesis nft, ResonanceEnergy re, ChladniNodeMiner miner) {
        string memory metadataCid = vm.envOr("METADATA_CID", string("REPLACE_METADATA_CID"));
        uint256 maxSupply = vm.envOr("MAX_SUPPLY", uint256(8888));
        uint256 mintPrice = vm.envOr("MINT_PRICE_WEI", uint256(0.01 ether));
        string memory baseURI = string.concat("ipfs://", metadataCid, "/");

        vm.startBroadcast();
        nft = new ResonanceGenesis(maxSupply, mintPrice, baseURI);
        re = new ResonanceEnergy();
        miner = new ChladniNodeMiner(address(nft), address(re));
        re.setMinter(address(miner));
        vm.stopBroadcast();
    }
}
