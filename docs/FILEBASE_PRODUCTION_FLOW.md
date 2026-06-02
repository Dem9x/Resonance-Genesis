# Filebase Production Flow

This flow connects the scientific Chladni generator to Solana Devnet and the legacy EVM contracts.

## 1. Generate V3 Scientific Collection

```bash
npm run gen:scientific:v3
```

Output:

```text
output_scientific_collection_v3/chladni-nodes/images
output_scientific_collection_v3/chladni-nodes/metadata
output_scientific_collection_v3/chladni-nodes/onchain-traits.json
output_scientific_collection_v3/chladni-nodes/traits.csv
output_scientific_collection_v3/chladni-nodes/summary.json
```

## 2. Convert SVG To PNG

```bash
npm run svg:png:v3
```

PNG output:

```text
output_scientific_collection_v3/chladni-nodes/png
```

## 3. Upload Images To Filebase

Upload the PNG folder to Filebase and save the resulting image CID.

```text
IMAGE_CID=YOUR_IMAGE_CID
```

## 4. Update Metadata Image Fields

```bash
node scripts/update-metadata-cid.mjs \
  --metadata-dir output_scientific_collection_v3/chladni-nodes/metadata \
  --image-cid YOUR_IMAGE_CID \
  --image-ext png
```

Validate:

```bash
npm run validate:scientific:v3 -- --image-ext png
```

## 5. Upload Metadata To Filebase

Upload the updated metadata folder and save the metadata CID.

```text
METADATA_CID=YOUR_METADATA_CID
```

## 6. Solana Devnet Usage

Use the metadata CID for frontend minting:

```env
NEXT_PUBLIC_METADATA_CID=YOUR_METADATA_CID
NEXT_PUBLIC_IMAGE_CID=YOUR_IMAGE_CID
NEXT_PUBLIC_SOLANA_IMAGE_CID=YOUR_IMAGE_CID
```

Use on-chain traits:

```bash
cd packages/solana
ONCHAIN_TRAITS_PATH=../../output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
NFT_MINT=PASTE_NFT_MINT \
TRAIT_TOKEN_ID=1 \
npm run set-traits
```

## 7. Legacy EVM Usage

Use the same metadata CID as base URI:

```text
ipfs://YOUR_METADATA_CID/
```

Use the same traits file with the legacy EVM trait script:

```bash
ONCHAIN_TRAITS_PATH=output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
forge script script/BatchSetTraits.s.sol:BatchSetTraits \
  --root packages/contracts \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

## Safety

RE and mining state are utility mechanics. Do not describe them as APY, passive income, guaranteed profit, or financial return.
