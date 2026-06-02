# Resonance Genesis Solana Devnet

This is the active path for the `solana-version` branch.

## Flow

```text
generate v3 -> convert png -> upload images to Filebase -> update metadata -> upload metadata -> create collection -> mint nodes -> set traits -> stake -> claim RE
```

## Commands

```bash
npm install
npm run gen:scientific:v3:test
npm run svg:png:v3
npm run validate:scientific:v3
npm run solana:build
npm run solana:test
```

## Solana Source Of Truth

- NFTs: Solana/Metaplex mint + metadata accounts
- Mining traits: NodeTraits PDAs
- Stake state: StakeAccount PDAs and token vault accounts
- RE: real SPL token mint and associated token accounts
- MongoDB/API: cache only

## Docs

```text
docs/SOLANA_DEVNET_STEP_BY_STEP.md
docs/FILEBASE_PRODUCTION_FLOW.md
docs/SCIENTIFIC_CHLADNI_GENERATOR.md
```
