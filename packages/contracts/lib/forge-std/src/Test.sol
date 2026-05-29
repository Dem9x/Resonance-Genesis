// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function warp(uint256) external;
    function deal(address, uint256) external;
    function expectEmit(bool, bool, bool, bool) external;
}

contract Test {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function assertTrue(bool value) internal pure {
        require(value, "assertTrue failed");
    }

    function assertEq(uint256 actual, uint256 expected) internal pure {
        require(actual == expected, "assertEq uint failed");
    }

    function assertEq(address actual, address expected) internal pure {
        require(actual == expected, "assertEq address failed");
    }

    function assertEq(string memory actual, string memory expected) internal pure {
        require(keccak256(bytes(actual)) == keccak256(bytes(expected)), "assertEq string failed");
    }

    function assertGt(uint256 actual, uint256 expected) internal pure {
        require(actual > expected, "assertGt failed");
    }
}
