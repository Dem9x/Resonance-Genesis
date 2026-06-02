import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
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
  const existingConfig = await provider.connection.getAccountInfo(globalConfig);

  if (existingConfig) {
    saveCache({
      reMintAddress,
      collectionMint: collectionMintAddress,
      globalConfig: globalConfig.toBase58(),
    });
    console.log("Global config already initialized");
    console.log(`GLOBAL_CONFIG=${globalConfig.toBase58()}`);
    process.exit(0);
  }

  let signature: string;
  try {
    signature = await program.methods
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
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error(error.message);
      const logs = await error.getLogs(provider.connection).catch(() => error.logs);
      console.error(logs?.join("\n") || "No transaction logs available.");
    }
    throw error;
  }

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
