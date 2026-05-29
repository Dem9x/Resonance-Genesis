// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function envString(string calldata) external returns (string memory);
    function envOr(string calldata, string calldata) external returns (string memory);
    function envOr(string calldata, uint256) external returns (uint256);
    function envAddress(string calldata) external returns (address);
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract Script {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}
