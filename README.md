# Resonance Genesis

Monorepo for the Resonance Genesis Chladni Node NFT and staking/miner dApp.

## Structure

```text
apps/web              Next.js App Router dApp
packages/contracts    Foundry Solidity workspace
```

The dApp is contract-first on Sepolia. If contract addresses are missing, minting, gallery, staking, and node detail pages show setup-required states instead of fake live NFTs.

## Install

```bash
npm install
```

Install Foundry if `forge` is not already available:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

On Windows, use Git Bash or WSL for `foundryup`, or download the Foundry Windows release ZIP and add it to `PATH`.

## Environment

Root `.env` for Foundry:

```bash
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
METADATA_CID=
IMAGE_CID=
RESONANCE_GENESIS_ADDRESS=
CHLADNI_NODE_MINER_ADDRESS=
MAX_SUPPLY=8888
MINT_PRICE_WEI=10000000000000000
```

`apps/web/.env.local` for the frontend:

```bash
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_RESONANCE_GENESIS_ADDRESS=
NEXT_PUBLIC_CHLADNI_NODE_MINER_ADDRESS=
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.filebase.io/ipfs/
NEXT_PUBLIC_METADATA_CID=
NEXT_PUBLIC_IMAGE_CID=
```

Do not commit private keys.

## Filebase/IPFS Flow

1. Upload generated node images to Filebase and save `IMAGE_CID`.
2. Generate metadata JSON using image URIs like `ipfs://<IMAGE_CID>/1.png`.
3. Upload the metadata folder to Filebase and save `METADATA_CID`.
4. Deploy `ResonanceGenesis` with base URI `ipfs://<METADATA_CID>/`.
5. Deploy `ChladniNodeMiner` with the NFT contract address.
6. Batch set compact on-chain mining traits.
7. Add deployed addresses to `apps/web/.env.local`.
8. Run the Next.js dApp.

## Foundry Commands

```bash
cd packages/contracts
forge build
forge test
```

Deploy to Sepolia:

```bash
forge script script/DeploySepolia.s.sol:DeploySepolia --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
```

Set base URI:

```bash
forge script script/SetBaseURI.s.sol:SetBaseURI --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
```

Batch set traits:

```bash
forge script script/BatchSetTraits.s.sol:BatchSetTraits --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
```

Verify contracts:

```bash
forge verify-contract <RESONANCE_GENESIS_ADDRESS> src/ResonanceGenesis.sol:ResonanceGenesis --chain sepolia --etherscan-api-key $ETHERSCAN_API_KEY --constructor-args <ABI_ENCODED_ARGS>
forge verify-contract <CHLADNI_NODE_MINER_ADDRESS> src/ChladniNodeMiner.sol:ChladniNodeMiner --chain sepolia --etherscan-api-key $ETHERSCAN_API_KEY --constructor-args <ABI_ENCODED_ARGS>
```

Use `cast abi-encode "constructor(uint256,uint256,string)" 8888 10000000000000000 "ipfs://<METADATA_CID>/"` for NFT constructor args and `cast abi-encode "constructor(address)" <RESONANCE_GENESIS_ADDRESS>` for the miner.

## Contract Traits

Only compact mining traits are stored on-chain:

```solidity
struct NodeTraits {
  uint32 frequency;
  uint8 modeN;
  uint8 modeM;
  uint16 nodeDensityBps;
  uint16 lineThicknessBps;
  uint8 rarityTier;
  bool initialized;
}
```

Metadata and images stay on Filebase/IPFS.

## Hashrate Formula

```text
frequencyWeight = sqrt(frequency) * 100
modeComplexity = modeN * modeM + abs(modeN - modeM) * 3
symmetryBonus = 500 if delta <= 1, 250 if delta <= 3
baseHashrate =
  frequencyWeight
  + modeComplexity * 40
  + nodeDensityBps * 3
  + lineThicknessBps * 2
  + symmetryBonus
hashrate = baseHashrate * rarityMultiplier / 100
pendingEnergy = hashrate * elapsedSeconds / 1 days
```

Resonance Energy is a utility point. The project does not promise APY, passive income, guaranteed rewards, or financial return.

## Frontend

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

The UI includes a persisted theme system with:

- `terminal-matrix-sand`
- `sci-fi-archive`
- `sand-gold-resonance`
- `void-neon`
- `classic-lab`

Theme changes only affect CSS variables and do not alter wallet connection, contract reads, minting, staking, gallery loading, or IPFS metadata fetching.

## Switch to Mainnet Later

Deploy the same Foundry contracts to mainnet, verify them, then update:

```bash
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=<mainnet rpc>
NEXT_PUBLIC_RESONANCE_GENESIS_ADDRESS=<mainnet nft>
NEXT_PUBLIC_CHLADNI_NODE_MINER_ADDRESS=<mainnet miner>
```
## Solana Devnet Version

This repository now includes a parallel Solana Devnet implementation in `packages/solana`. The EVM/Foundry contracts remain intact.

### Setup

Install Solana CLI and Anchor, then configure Devnet:

```bash
solana config set --url devnet
solana airdrop 2
```

Add Solana environment variables:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID=
NEXT_PUBLIC_RE_MINT_ADDRESS=
NEXT_PUBLIC_CHLADNI_COLLECTION_MINT=
NEXT_PUBLIC_SOLANA_EXPLORER_CLUSTER=devnet

SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
RESONANCE_SOLANA_PROGRAM_ID=
RE_MINT_ADDRESS=
CHLADNI_COLLECTION_MINT=
```

### Commands

```bash
npm run solana:build
npm run solana:test
npm run solana:deploy:devnet
npm run solana:create-re-token
npm run solana:initialize
npm run solana:mint-samples
npm run solana:set-traits
```

RE on Solana is designed as a real SPL token with 9 decimals and a 1,000,000,000 RE max supply. Claims unlock at 33 RE. RE is utility power, not APY, passive income, profit, or a guaranteed financial return.
