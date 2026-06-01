// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ResonanceEnergy is ERC20, ERC20Capped, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

    address public minter;

    event MinterUpdated(address indexed minter);

    constructor() ERC20("Resonance Energy", "RE") ERC20Capped(MAX_SUPPLY) Ownable(msg.sender) {}

    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "zero minter");
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "not minter");
        _mint(to, amount);
    }

    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }

    function remainingSupply() external view returns (uint256) {
        return cap() - totalSupply();
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
