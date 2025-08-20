# Confidential Voting DApp (Zama FHEVM)

A minimal confidential voting smart contract using **Zama's FHEVM**. Voters cast encrypted votes on-chain; only the final tallies can be decrypted (never individual votes).

## Features
- Encrypted vote casting (`ebool`)
- Encrypted tallying with `FHE.add` and `FHE.select`
- Double-vote protection
- Permissioned decryption using `FHE.allow` for final results

## Stack
- Solidity (`@fhevm/solidity`)
- Hardhat + Ethers
- (Optional) `@fhevm/hardhat-plugin` to generate encrypted inputs for tests and scripts

## Quick Start

```bash
# 1) Clone and install
npm i

# 2) Compile
npx hardhat compile

# 3) Run tests (uses fhevm plugin to create encrypted inputs)
npx hardhat test

# 4) Deploy to Sepolia + FHEVM coprocessor (example network)
cp .env.example .env        # set PRIVATE_KEY + RPC_URL
npx hardhat run scripts/deploy.js --network sepolia
```

> ⚠ Note: You need access to an FHEVM-enabled testnet (e.g., Zama's Sepolia coprocessor) and to install the plugin packages listed in `package.json`.

## Contract Overview

- `vote(externalEbool encryptedVote)` — takes an encrypted boolean and updates `yesCount` / `noCount` *in encrypted form*.
- `getResults()` — returns `(euint32 yes, euint32 no)` without decrypting on-chain.
- `allowResults(address who)` — grants `who` decryption rights over the two ciphertext handles.

## Security & Privacy Model
- Individual votes are never decrypted on-chain.
- Final tallies can be made readable by a designated address (DAO, multisig, or off-chain verifier).

## License
MIT
