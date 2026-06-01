// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ResonanceEnergy} from "../src/ResonanceEnergy.sol";

contract ResonanceEnergyTest is Test {
    ResonanceEnergy internal re;
    address internal minter = address(0xBEEF);
    address internal user = address(0xCAFE);

    function setUp() public {
        re = new ResonanceEnergy();
        re.setMinter(minter);
    }

    function testOnlyMinterCanMint() public {
        (bool success,) = address(re).call(abi.encodeCall(ResonanceEnergy.mint, (user, 1 ether)));
        assertTrue(!success);
        assertEq(re.balanceOf(user), 0);

        vm.prank(minter);
        re.mint(user, 1 ether);
        assertEq(re.balanceOf(user), 1 ether);
    }

    function testMaxAndRemainingSupply() public {
        assertEq(re.maxSupply(), 1_000_000_000 ether);
        assertEq(re.remainingSupply(), 1_000_000_000 ether);

        vm.prank(minter);
        re.mint(user, 10 ether);

        assertEq(re.totalSupply(), 10 ether);
        assertEq(re.remainingSupply(), 999_999_990 ether);
    }
}
