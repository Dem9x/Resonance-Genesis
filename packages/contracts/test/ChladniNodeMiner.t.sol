// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ResonanceGenesis} from "../src/ResonanceGenesis.sol";
import {ChladniNodeMiner} from "../src/ChladniNodeMiner.sol";
import {ResonanceEnergy} from "../src/ResonanceEnergy.sol";

contract ChladniNodeMinerTest is Test {
    ResonanceGenesis internal nft;
    ResonanceEnergy internal re;
    ChladniNodeMiner internal miner;
    address internal user = address(0xCAFE);

    function setUp() public {
        nft = new ResonanceGenesis(100, 0.01 ether, "ipfs://metadata-cid/");
        re = new ResonanceEnergy();
        miner = new ChladniNodeMiner(address(nft), address(re));
        re.setMinter(address(miner));
        vm.deal(user, 1 ether);

        vm.prank(user);
        nft.mint{value: 0.01 ether}(1);

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;
        ResonanceGenesis.NodeTraits[] memory traits = new ResonanceGenesis.NodeTraits[](1);
        traits[0] = ResonanceGenesis.NodeTraits(963, 6, 8, 920, 102, 2, true);
        nft.batchSetNodeTraits(tokenIds, traits);
    }

    function testHashrateUsesOnchainTraits() public view {
        assertEq(miner.hashrateOf(1), 11439);
    }

    function testStakeClaimAndUnstake() public {
        vm.startPrank(user);
        nft.approve(address(miner), 1);
        miner.stake(1);
        vm.stopPrank();

        assertTrue(miner.isStaked(1));

        vm.warp(block.timestamp + 1 hours);
        assertGt(miner.pendingEnergy(1), 0);

        vm.startPrank(user);
        miner.claim(1);
        assertGt(re.balanceOf(user), 0);
        miner.unstake(1);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), user);
        assertTrue(!miner.isStaked(1));
    }
}
