import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getProgram, getProvider, globalConfigPda, loadCache, saveCache, systemProgram } from "./lib";

async function main() {
  const cache = loadCache();
  const reMintAddress = process.env.RE_MINT_ADDRESS || cache.reMintAddress;
  const collectionMintAddress = process.env.CHLADNI_COLLECTION_MINT || cache.collectionMint;

  if (!reMintAddress) {
    throw new Error("Missing RE_MINT_ADDRESS. Run npm run create-re-token first or export RE_MINT_ADDRESS.");
  }
  if (!collectionMintAddress) {
    throw new Error("Missing CHLADNI_COLLECTION_MINT. Run npm run create-collection first or export CHLADNI_COLLECTION_MINT.");
  }

  const { payer, provider } = getProvider();
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();
  const energyScale = Number(process.env.ENERGY_SCALE || "86400");

  const signature = await program.methods
    .initialize({
      treasury: payer.publicKey,
      energyScale: new anchor.BN(energyScale),
    })
    .accounts({
      authority: payer.publicKey,
      reMint: new PublicKey(reMintAddress),
      collectionMint: new PublicKey(collectionMintAddress),
      globalConfig,
      systemProgram,
    })
    .rpc();

  saveCache({
    reMintAddress,
    collectionMint: collectionMintAddress,
    globalConfig: globalConfig.toBase58(),
    initializedSignature: signature,
  });

  console.log(`GLOBAL_CONFIG=${globalConfig.toBase58()}`);
  console.log(`INITIALIZE_SIGNATURE=${signature}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
