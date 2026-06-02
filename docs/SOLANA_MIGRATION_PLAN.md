# Resonance Genesis Solana Migration Plan

This branch adds a parallel Solana Devnet implementation. It does not delete or replace the existing EVM, Foundry, wagmi, RainbowKit, waitlist, news, docs, or theme system.

## Reused From EVM Version

- Brand identity: Resonance Genesis / Chladni Node / RE
- Chladni trait model: frequency, mode N/M, node density, line thickness, rarity
- Deterministic hashrate formula
- Filebase/IPFS image and metadata pipeline
- Existing Next.js theme system and miner-console visual language
- MongoDB as optional cache/index layer

## Rebuilt For Solana

- Anchor program in `packages/solana`
- SPL RE token with 1,000,000,000 RE max supply
- NFT escrow through program-controlled token vaults
- Claim threshold of 33 RE
- Solana wallet adapter frontend layer
- `/solana`, `/solana/stake`, `/solana/gallery`, and `/solana/node/[mint]`

## EVM vs Solana Architecture

EVM uses ERC721, ERC20, and a Solidity staking contract. Solana uses SPL tokens, PDAs, token vault accounts, and an Anchor program.

MongoDB is not source of truth. It can cache metadata and events, while Solana program accounts and SPL token accounts remain authoritative.

## Devnet Roadmap

1. Build Anchor program.
2. Create RE SPL mint with 9 decimals and program PDA mint authority.
3. Initialize global config.
4. Mint sample Chladni Node NFTs from Filebase/IPFS metadata.
5. Set NodeTraits PDAs.
6. Stake Devnet NFTs into program vaults.
7. Claim real SPL RE once claimable RE reaches 33 RE.
8. Add event indexer for optional MongoDB cache.

Scientific generation note: use `output_scientific_collection_v3/chladni-nodes/onchain-traits.json` with `packages/solana/scripts/set-node-traits.ts` to write deterministic Chladni traits into NodeTraits PDAs.

## Mainnet Checklist

- Final audit of program authority model
- Governance/multisig for config authority and mint authority
- Collection verification through Metaplex metadata
- RPC provider redundancy and rate limits
- Event indexing and cache backfill
- Public documentation that RE is utility power, not APY or profit
