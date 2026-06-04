import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import { getProgram, getProvider, globalConfigPda, loadCache, readGlobalConfig, saveCache, systemProgram } from "./lib";

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
  const maxSupply = Number(process.env.SOLANA_MAX_SUPPLY || process.env.MAX_SUPPLY || "1212");
  const existingConfig = await provider.connection.getAccountInfo(globalConfig);

  if (existingConfig) {
    saveCache({
      reMintAddress,
      collectionMint: collectionMintAddress,
      globalConfig: globalConfig.toBase58(),
    });
    console.log("Global config already initialized");
    console.log(`GLOBAL_CONFIG=${globalConfig.toBase58()}`);
    try {
      const config = await readGlobalConfig(program, globalConfig);
      console.log(`NEXT_TOKEN_ID=${config.nextTokenId?.toString?.() || "unknown-old-layout"}`);
      console.log(`MINTED_COUNT=${config.mintedCount?.toString?.() || "unknown-old-layout"}`);
      console.log(`MAX_SUPPLY=${config.maxSupply?.toString?.() || "unknown-old-layout"}`);
    } catch (error) {
      console.log("GLOBAL_CONFIG_LAYOUT=old-or-incompatible");
      console.log("Run npm run migrate-global-config after deploying the upgraded program.");
      console.log("If .cache is missing, set MIGRATION_NEXT_TOKEN_ID manually, for example MIGRATION_NEXT_TOKEN_ID=10.");
    }
    process.exit(0);
  }

  let signature: string;
  try {
    signature = await program.methods
      .initialize({
        treasury: payer.publicKey,
        energyScale: new anchor.BN(energyScale),
        maxSupply: new anchor.BN(maxSupply),
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
  console.log(`NEXT_TOKEN_ID=1`);
  console.log(`MINTED_COUNT=0`);
  console.log(`MAX_SUPPLY=${maxSupply}`);
  console.log(`INITIALIZE_SIGNATURE=${signature}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
