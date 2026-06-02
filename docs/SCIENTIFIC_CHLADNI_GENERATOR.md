# Scientific Chladni Generator

Resonance Genesis includes a scientific generation pipeline for deterministic Chladni Node NFT assets, metadata, and compact on-chain mining traits.

## Overview

V2 is the original black/white scientific Chladni renderer. It produces deterministic nodal line SVGs that feel like a clean lab plate or museum specimen.

V3 is the color scientific renderer. It keeps the deterministic Chladni math and adds rarity-based palettes for a premium cymatics collection style.

Both generators output SVG images, NFT metadata, per-token trait JSON, `traits.csv`, `summary.json`, and `onchain-traits.json`.

## Rarity Color Rules

V3 colorways:

- Common: Natural Sand
- Uncommon: Warm Sand
- Rare: Cyan Flux
- Epic: Violet Resonance
- Legendary: Gold Signal
- Mythic: Prism Core

Common must stay normal, soft, and museum-like. It should not look neon or overpowered. Higher rarity tiers can use stronger color and glow.

## Commands

Test V2:

```bash
npm run gen:scientific:v2:test
```

Test V3:

```bash
npm run gen:scientific:v3:test
```

Generate full V2:

```bash
npm run gen:scientific:v2
```

Generate full V3:

```bash
npm run gen:scientific:v3
```

Convert SVG to PNG:

```bash
npm run svg:png:v3
```

Validate output:

```bash
npm run validate:scientific:v2
npm run validate:scientific:v3
```

Update metadata after Filebase image upload:

```bash
node scripts/update-metadata-cid.mjs \
  --metadata-dir output_scientific_collection_v3/chladni-nodes/metadata \
  --image-cid YOUR_IMAGE_CID \
  --image-ext png
```

## Output Paths

V2:

```text
output_scientific_collection_v2/chladni-nodes
```

V3:

```text
output_scientific_collection_v3/chladni-nodes
```

Each mode outputs:

```text
images/
metadata/
traits/
onchain-traits.json
traits.csv
summary.json
```

Example:

```text
output_scientific_collection_v3/chladni-nodes/images/1.svg
output_scientific_collection_v3/chladni-nodes/metadata/1.json
output_scientific_collection_v3/chladni-nodes/onchain-traits.json
output_scientific_collection_v3/chladni-nodes/traits.csv
output_scientific_collection_v3/chladni-nodes/summary.json
```

## Metadata Fields

Metadata includes:

- name
- description
- image
- tokenId
- frequency
- waveNumberK
- modeN
- modeM
- patternName
- family
- colorway and colorwayId for V3
- nodeDensity and nodeDensityBps
- lineThickness and lineThicknessBps
- rarityTier and rarityName
- frequencyBand
- symmetryType
- nodeArchitecture
- waveDistortion
- harmonicLayerCount
- hashratePreview
- renderer
- attributes

## Filebase Upload Flow

Recommended production flow:

1. Generate the V3 collection.
2. Convert SVG to PNG.
3. Upload the PNG folder to Filebase.
4. Copy the image CID.
5. Update metadata image fields.
6. Upload the metadata folder to Filebase.
7. Use the metadata CID for EVM `baseURI` or Solana metadata minting.
8. Use `onchain-traits.json` for EVM or Solana on-chain trait writes.

Example:

```bash
npm run gen:scientific:v3
npm run svg:png:v3
node scripts/update-metadata-cid.mjs \
  --metadata-dir output_scientific_collection_v3/chladni-nodes/metadata \
  --image-cid YOUR_IMAGE_CID \
  --image-ext png
npm run validate:scientific:v3 -- --image-ext png
```

## Solana Integration

For Solana Devnet, use:

```text
output_scientific_collection_v3/chladni-nodes/onchain-traits.json
```

This file is the mining trait source of truth. Metadata is for visual display and collection indexing; the Anchor miner program uses NodeTraits PDAs.

Set traits for generated or minted node mints:

```bash
ONCHAIN_TRAITS_PATH=output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
NFT_MINTS=mint1,mint2,mint3 \
npm run set-traits -w @resonance/solana
```

For one frontend-minted NFT:

```bash
ONCHAIN_TRAITS_PATH=output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
NFT_MINT=PASTE_FRONTEND_MINT \
TRAIT_TOKEN_ID=1 \
npm run set-traits -w @resonance/solana
```

The script writes compact values into NodeTraits PDAs:

```text
frequency
modeN
modeM
nodeDensityBps
lineThicknessBps
rarityTier
initialized=true
```

## EVM Integration

For EVM Sepolia, use:

```text
output_scientific_collection_v3/chladni-nodes/onchain-traits.json
```

Example:

```bash
ONCHAIN_TRAITS_PATH=output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
forge script script/BatchSetTraits.s.sol:BatchSetTraits \
  --root packages/contracts \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

## Safety Note

Resonance Energy and Chladni Node mining traits are utility mechanics. Do not describe RE as APY, passive income, guaranteed rewards, or financial return.
