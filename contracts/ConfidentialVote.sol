// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FHE, euint32, ebool, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ConfidentialVote - Private voting using Zama FHEVM
/// @notice Individual votes remain encrypted; only aggregated tallies can be decrypted by permission.
contract ConfidentialVote is SepoliaConfig {
    mapping(address => bool) public hasVoted;
    euint32 private yesCount;
    euint32 private noCount;

    event Voted(address indexed voter);
    event Allowed(address indexed who);

    constructor() {
        yesCount = FHE.asEuint32(0);
        noCount = FHE.asEuint32(0);
    }

    function vote(externalEbool calldata encVote) external {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;

        ebool choice = FHE.asEbool(encVote);
        // if choice == true -> add 1 to yes; else -> add 1 to no
        yesCount = FHE.add(yesCount, FHE.select(choice, FHE.asEuint32(1), FHE.asEuint32(0)));
        noCount  = FHE.add(noCount,  FHE.select(choice, FHE.asEuint32(0), FHE.asEuint32(1)));

        emit Voted(msg.sender);
    }

    /// @dev Returns encrypted tallies; caller may need permission to decrypt.
    function getResults() external view returns (euint32, euint32) {
        return (yesCount, noCount);
    }

    /// @notice Grants decryption permissions to `who` for both tallies.
    function allowResults(address who) external {
        FHE.allow(yesCount, who);
        FHE.allow(noCount, who);
        emit Allowed(who);
    }
}
