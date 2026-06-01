// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ResonanceGenesis} from "../src/ResonanceGenesis.sol";

contract ResonanceGenesisTest is Test {
    ResonanceGenesis internal nft;
    address internal user = address(0xBEEF);

    function setUp() public {
        nft = new ResonanceGenesis(100, 0.01 ether, "ipfs://metadata-cid/");
        vm.deal(user, 1 ether);
    }

    function testMintAndTokenURI() public {
        vm.prank(user);
        nft.mint{value: 0.01 ether}(1);

        assertEq(nft.ownerOf(1), user);
        assertEq(nft.tokenURI(1), "ipfs://metadata-cid/1.json");
        assertEq(nft.totalSupply(), 1);
    }

    function testBatchSetNodeTraitsBeforeMint() public {
        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 1;
        tokenIds[1] = 2;

        ResonanceGenesis.NodeTraits[] memory traits = new ResonanceGenesis.NodeTraits[](2);
        traits[0] = ResonanceGenesis.NodeTraits(963, 6, 8, 920, 102, 2, true);
        traits[1] = ResonanceGenesis.NodeTraits(528, 4, 4, 800, 95, 1, true);

        nft.batchSetNodeTraits(tokenIds, traits);

        ResonanceGenesis.NodeTraits memory stored = nft.getNodeTraits(1);
        assertEq(stored.frequency, 963);
        assertTrue(stored.initialized);

        vm.prank(user);
        nft.mint{value: 0.01 ether}(1);
        assertEq(nft.ownerOf(1), user);
    }
}
