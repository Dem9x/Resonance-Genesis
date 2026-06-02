# Resonance Genesis Solana Devnet Step By Step

This guide starts from a fresh WSL terminal and ends with a real Devnet stake and RE claim test.

Solana Devnet is the active branch path. EVM/Sepolia is retained as Legacy EVM Reference.

## 1. Open WSL And Enter The Repo

```bash
cd /mnt/c/Users/User/Documents/Codex/2026-05-29/you-are-a-senior-full-stack
git pull
cd packages/solana
```

Use Linux Node inside WSL. If `tsx` fails with an esbuild platform error, install/rebuild from WSL:

```bash
cd /mnt/c/Users/User/Documents/Codex/2026-05-29/you-are-a-senior-full-stack
npm install
npm rebuild esbuild
cd packages/solana
```

## 2. Solana Wallet And Devnet SOL

Create a WSL keypair if needed:

```bash
solana-keygen new --no-bip39-passphrase -o ~/.config/solana/id.json
solana config set --url devnet
solana address
```

Fund the wallet:

```bash
solana airdrop 2
solana balance
```

Deploying can need more than 2 SOL, so repeat the airdrop or use the Solana faucet if needed.

## 3. Export Script Environment

```bash
export SOLANA_RPC_URL=https://api.devnet.solana.com
export SOLANA_KEYPAIR=/home/dimassell/.config/solana/id.json
export RESONANCE_SOLANA_PROGRAM_ID=bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7
```

RE, NFT, staking, and dashboard state are read from Solana/SPL accounts. MongoDB/API cache is optional and must not be treated as source of truth.

Optional metadata envs:

```bash
export METADATA_CID=PASTE_METADATA_CID
export COLLECTION_METADATA_URI=https://mild-fuchsia-loon.myfilebase.com/ipfs/PASTE_COLLECTION_JSON_OR_FOLDER
```

If `METADATA_CID` is set, node metadata URIs become:

```text
ipfs://<METADATA_CID>/1.json
ipfs://<METADATA_CID>/2.json
```

## 4. Build And Deploy The Anchor Program

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Current Devnet program:

```text
bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7
```

If the program id changes after a new deploy, update:

- `packages/solana/Anchor.toml`
- `packages/solana/programs/resonance_genesis/src/lib.rs`
- frontend env values

Then rebuild and deploy again.

## 5. Create The RE Token Mint

RE is a real SPL token. It uses 9 decimals and is minted by the program PDA when users claim.

```bash
npm run create-re-token
```

Example output:

```text
RE_MINT_ADDRESS=A97SvjGAGDQ4pWbFCy9qRo9n8tFu9v2yKYnRUxUnuPvL
RE_MINT_AUTHORITY_PDA=EL51d8bCsrct1jP2edQ1teHWivw1BQ3WvLghMkgRVsVU
```

Export it:

```bash
export RE_MINT_ADDRESS=A97SvjGAGDQ4pWbFCy9qRo9n8tFu9v2yKYnRUxUnuPvL
```

## 6. Create The Chladni Collection NFT

This creates a real Metaplex collection NFT with metadata and master edition.

```bash
npm run create-collection
```

Example output:

```text
CHLADNI_COLLECTION_MINT=8UmYv4F1LBCFgaf2cioz32MSrF2g2K2zvG9h7QLNjRkR
CHLADNI_COLLECTION_TOKEN_ACCOUNT=J2w14rVw4N4Js7ADx7Fq57kYKMBrgpVysjjh5eUTmqzy
CHLADNI_COLLECTION_METADATA=AHGssojugUngXYLJ253LvqfF6GRbodXiGhUPqPm1LJgQ
CHLADNI_COLLECTION_MASTER_EDITION=9cqxu7RXpiSGVLJ3AKKFFF1o8uzaZZuUZ7KMMZrWuYap
```

Export the mint:

```bash
export CHLADNI_COLLECTION_MINT=8UmYv4F1LBCFgaf2cioz32MSrF2g2K2zvG9h7QLNjRkR
```

Important: no spaces around `=` in shell exports.

## 7. Initialize Global Config

Only run this once per program deployment. It creates the `global_config` PDA.

```bash
npm run initialize
```

Example output:

```text
GLOBAL_CONFIG=DxAtxSYTaNXxAsdYtHo7AnWfACJxrub3UbjsExaNoG7a
INITIALIZE_SIGNATURE=...
```

If `global_config` already exists, do not run initialize again for the same program.

## 8. Mint Sample Chladni Node NFTs

These are real Metaplex NFTs with metadata and master editions. They also remain compatible with the staking program because each mint has decimals `0` and supply `1`.

```bash
export SAMPLE_NODE_COUNT=3
npm run mint-samples
```

Example output:

```text
NODE_1_MINT=...
NODE_1_TOKEN_ACCOUNT=...
NODE_1_METADATA=...
NODE_1_MASTER_EDITION=...
NODE_1_METADATA_URI=...
SAMPLE_NODE_COUNT=3
```

The scripts save deployment state in:

```text
packages/solana/.cache/solana-devnet.json
```

To use scientific generator traits, generate V3 first:

```bash
npm run gen:scientific:v3:test
```

Then set traits from:

```text
output_scientific_collection_v3/chladni-nodes/onchain-traits.json
```

## 9. Set On-Chain Mining Traits

Solana cannot read JSON metadata directly, so compact mining traits must be stored in NodeTraits PDAs.

```bash
npm run set-traits
```

Or explicitly provide scientific traits and mints:

```bash
ONCHAIN_TRAITS_PATH=output_scientific_collection_v3/chladni-nodes/onchain-traits.json \
NFT_MINTS=mint1,mint2,mint3 \
npm run set-traits
```

Example output:

```text
NODE_1_TRAITS_PDA=...
NODE_1_SET_TRAITS_SIGNATURE=...
TRAITS_SET_COUNT=3
```

## 10. Stake A Node

Pick a node mint from `mint-samples` output or from the cache:

```bash
cat .cache/solana-devnet.json
```

Stake:

```bash
export NFT_MINT=PASTE_NODE_MINT
npm run stake-test-node
```

Example output:

```text
NFT_MINT=GadQqHJEngxAnj1XpngnYJTD8Weudoyov6m7mksPmP7h
STAKE_ACCOUNT=AQ6oYhCvsptg4MfFJBH82uVFyLo1W8zZ5M6QuCSPA1iv
VAULT_NFT_ACCOUNT=8PEEWH5JaJZRDEGSXjAysB1DjUS2JncrNT9AErk5p9RL
STAKE_SIGNATURE=...
```

The NFT is transferred into the program vault and becomes an active miner.

## 11. Claim RE

Claims unlock at the configured minimum claim threshold, currently `33 RE`. If you claim too early, `MinimumClaimNotReached` is expected.

```bash
export NFT_MINT=PASTE_STAKED_NODE_MINT
npm run claim-test-re
```

Successful output:

```text
NFT_MINT=...
USER_RE_ACCOUNT=...
CLAIM_RE_SIGNATURE=...
```

RE is minted to the user's associated token account by the program PDA mint authority.

## 12. Frontend Env

Add this to `apps/web/.env.local`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID=bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7
NEXT_PUBLIC_RE_MINT_ADDRESS=A97SvjGAGDQ4pWbFCy9qRo9n8tFu9v2yKYnRUxUnuPvL
NEXT_PUBLIC_CHLADNI_COLLECTION_MINT=8UmYv4F1LBCFgaf2cioz32MSrF2g2K2zvG9h7QLNjRkR

SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
RESONANCE_SOLANA_PROGRAM_ID=bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7
RE_MINT_ADDRESS=A97SvjGAGDQ4pWbFCy9qRo9n8tFu9v2yKYnRUxUnuPvL
CHLADNI_COLLECTION_MINT=8UmYv4F1LBCFgaf2cioz32MSrF2g2K2zvG9h7QLNjRkR
```

Then run:

```bash
cd /mnt/c/Users/User/Documents/Codex/2026-05-29/you-are-a-senior-full-stack
npm run dev
```

## 13. Troubleshooting

If `esbuild` says `win32-x64` is installed but Linux needs `linux-x64`, rebuild/install dependencies inside WSL:

```bash
npm install
npm rebuild esbuild
```

If Metaplex says `Cannot create NFT with no Freeze Authority`, pull the latest branch. The scripts must create NFT mints with payer as freeze authority.

If `set-traits` says `global_config AccountNotInitialized`, run:

```bash
npm run initialize
```

If `initialize` says the account already exists, the program has already been initialized.

If `claim-test-re` says `MinimumClaimNotReached`, wait longer before claiming.

## Safety Note

RE is utility power for Resonance Genesis. Do not describe it as APY, passive income, guaranteed rewards, or financial return.
