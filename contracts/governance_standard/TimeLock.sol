// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/governance/TimelockController.sol";


contract TimeLock is TimelockController {
    // minDelay: How long you have to wait before execution
    // proposers is the list of addresses that can propose
    // executors: Who can execute when a proposal passes


    constructor( 
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executers
    ) TimelockController(minDelay, proposers, executers) {
       
    }
}