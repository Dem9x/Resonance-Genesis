# Resonance Genesis

Solana-first monorepo for the Resonance Genesis Chladni Node NFT and staking/miner dApp.

On the `solana-version` branch, the active production path is Solana Devnet:

```text
scientific generator v3 -> Filebase/IPFS metadata -> Metaplex NFT mint -> NodeTraits PDA -> staking vault -> real SPL RE claim
```

The EVM/Foundry implementation remains in the repository as a Legacy EVM Reference and must not be deleted.

## Source Of Truth

- Visual NFT source: scientific generator V3
- NFT metadata source: Filebase metadata CID
- Mining trait source: `onchain-traits.json` written to Solana NodeTraits PDAs
- RE source: real SPL token mint
- Dashboard source: Solana accounts and SPL token accounts
- MongoDB/API: optional cache only

No flow should treat mock data, MongoDB, or frontend-only state as source of truth.

## Structure

```text
apps/web              Next.js App Router dApp
packages/solana       Anchor Solana Devnet program and scripts
packages/contracts    Legacy Foundry Solidity workspace
scripts/              Scientific Chladni collection generator
docs/                 Solana, Filebase, and generator docs
```

## Install

```bash
npm install
```

For Solana work, use WSL/Linux with Solana CLI, Rust/Cargo, and Anchor installed.

## Solana Devnet Quick Start

```bash
cd packages/solana
solana config set --url devnet
solana airdrop 2

export SOLANA_RPC_URL=https://api.devnet.solana.com
export SOLANA_KEYPAIR=/home/dimassell/.config/solana/id.json
export RESONANCE_SOLANA_PROGRAM_ID=bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7
```

Build and test:

```bash
npm run solana:build
npm run solana:test
```

Create RE and initialize:

```bash
npm run solana:create-re-token
export RE_MINT_ADDRESS=PASTE_RE_MINT

npm run solana:create-collection
export CHLADNI_COLLECTION_MINT=PASTE_COLLECTION_MINT

npm run solana:initialize
```

`npm run solana:initialize` is idempotent. If `global_config` already exists, it prints `Global config already initialized` and exits successfully.

## Scientific NFT Generation

V3 is the active visual pipeline:

```bash
npm run gen:scientific:v3:test
npm run svg:png:v3
npm run validate:scientific:v3
```

Full collection:

```bash
npm run gen:scientific:v3
npm run svg:png:v3
```

After uploading PNG images to Filebase:

```bash
node scripts/update-metadata-cid.mjs \
  --metadata-dir output_scientific_collection_v3/chladni-nodes/metadata \
  --image-cid YOUR_IMAGE_CID \
  --image-ext png
```

Then upload the metadata folder to Filebase and use the metadata CID for Solana minting and/or EVM base URI.

Generator docs:

```text
docs/SCIENTIFIC_CHLADNI_GENERATOR.md
docs/FILEBASE_PRODUCTION_FLOW.md
```

## Set Solana Mining Traits

Mining traits are written from the generated scientific `onchain-traits.json` into NodeTraits PDAs.

For one frontend-minted NFT:

```bash
cd packages/solana
ONCHAIN_TRAITS_PATH=../../output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
NFT_MINT=PASTE_NFT_MINT \
TRAIT_TOKEN_ID=1 \
npm run set-traits
```

For a list of mints:

```bash
ONCHAIN_TRAITS_PATH=../../output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
NFT_MINTS=mint1,mint2,mint3 \
npm run set-traits
```

The script validates that frequency, mode N/M, node density BPS, and line thickness BPS are non-zero before sending transactions.

## Stake And Claim RE

Stake:

```bash
export NFT_MINT=PASTE_TRAIT_INITIALIZED_NFT_MINT
npm run stake-test-node
```

Claim:

```bash
npm run claim-test-re
```

RE is a real SPL token with 9 decimals. The max supply is 1,000,000,000 RE and claims unlock at the 33 RE threshold. RE is utility power, not APY, passive income, profit, or guaranteed financial return.

## Frontend

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID=bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7
NEXT_PUBLIC_RE_MINT_ADDRESS=PASTE_RE_MINT
NEXT_PUBLIC_CHLADNI_COLLECTION_MINT=PASTE_COLLECTION_MINT
NEXT_PUBLIC_SOLANA_EXPLORER_CLUSTER=devnet
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.filebase.io/ipfs/
NEXT_PUBLIC_METADATA_CID=PASTE_METADATA_CID
NEXT_PUBLIC_IMAGE_CID=PASTE_IMAGE_CID
NEXT_PUBLIC_SOLANA_IMAGE_CID=PASTE_IMAGE_CID
NEXT_PUBLIC_SOLANA_MINT_METADATA_TOKEN_ID=1
NEXT_PUBLIC_SOLANA_IMAGE_FALLBACK_COUNT=20
```

Run:

```bash
npm run dev
```

Solana routes:

```text
/solana
/solana/mint
/solana/gallery
/solana/stake
/solana/node/[mint]
```

The frontend reads wallet NFTs, Metaplex metadata, NodeTraits PDAs, StakeAccount PDAs, and RE SPL balances from Solana/SPL accounts. It should show setup-required states if environment values are missing.

## Validation Commands

```bash
npm run gen:scientific:v3:test
npm run svg:png:v3
npm run validate:scientific:v3
npm run solana:build
npm run solana:test
npm run typecheck
npm run build
```

## Full Docs

```text
docs/SOLANA_DEVNET_STEP_BY_STEP.md
docs/SOLANA_MIGRATION_PLAN.md
docs/SCIENTIFIC_CHLADNI_GENERATOR.md
docs/FILEBASE_PRODUCTION_FLOW.md
```

## Legacy EVM Reference

The Sepolia/EVM implementation remains under:

```text
packages/contracts
```

Legacy commands:

```bash
npm run forge:build
npm run forge:test
```

Legacy deployment scripts remain available in `packages/contracts/script`. Use the scientific `onchain-traits.json` with the EVM batch trait script when maintaining the EVM reference.

Do not remove EVM files from this branch; they are retained for historical compatibility and future reference.
