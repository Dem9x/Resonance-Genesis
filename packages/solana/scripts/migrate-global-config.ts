import * as anchor from "@coral-xyz/anchor";
import { SendTransactionError } from "@solana/web3.js";
import { getProgram, getProvider, globalConfigPda, loadCache, readGlobalConfig, saveCache, systemProgram } from "./lib";

function envNumber(name: string) {
  const value = process.env[name];
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number. Received ${value}`);
  return parsed;
}

function migrationCounters() {
  const cache = loadCache();
  const maxCachedTokenId = Math.max(0, ...(cache.sampleNodes || []).map((node) => Number(node.tokenId || 0)));
  const nextTokenId = envNumber("MIGRATION_NEXT_TOKEN_ID") || envNumber("SOLANA_MIGRATION_NEXT_TOKEN_ID") || maxCachedTokenId + 1 || 1;
  const mintedCount = envNumber("MIGRATION_MINTED_COUNT") ?? Math.max(0, nextTokenId - 1);
  const maxSupply = envNumber("SOLANA_MAX_SUPPLY") || envNumber("MAX_SUPPLY") || 1212;

  if (nextTokenId <= 0) throw new Error("MIGRATION_NEXT_TOKEN_ID must be greater than 0.");
  if (mintedCount >= nextTokenId) throw new Error("MIGRATION_MINTED_COUNT must be lower than MIGRATION_NEXT_TOKEN_ID.");
  if (maxSupply <= 0) throw new Error("SOLANA_MAX_SUPPLY must be greater than 0.");
  if (nextTokenId > maxSupply + 1) throw new Error("MIGRATION_NEXT_TOKEN_ID cannot be greater than SOLANA_MAX_SUPPLY + 1.");

  return { cache, nextTokenId, mintedCount, maxSupply };
}

async function main() {
  const { cache, nextTokenId, mintedCount, maxSupply } = migrationCounters();
  const { payer, provider } = getProvider();
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();
  const accountInfo = await provider.connection.getAccountInfo(globalConfig);

  if (!accountInfo) {
    throw new Error("GlobalConfig account is missing. Run npm run initialize instead of migrate-global-config.");
  }

  try {
    const config = await readGlobalConfig(program, globalConfig);
    console.log("Global config already uses the upgraded layout.");
    console.log(`GLOBAL_CONFIG=${globalConfig.toBase58()}`);
    console.log(`NEXT_TOKEN_ID=${config.nextTokenId.toString()}`);
    console.log(`MINTED_COUNT=${config.mintedCount.toString()}`);
    console.log(`MAX_SUPPLY=${config.maxSupply.toString()}`);
    process.exit(0);
  } catch {
    console.log("GLOBAL_CONFIG_LAYOUT=old-or-incompatible");
    console.log(`MIGRATION_NEXT_TOKEN_ID=${nextTokenId}`);
    console.log(`MIGRATION_MINTED_COUNT=${mintedCount}`);
    console.log(`SOLANA_MAX_SUPPLY=${maxSupply}`);
  }

  try {
    const signature = await program.methods
      .migrateGlobalConfig({
        nextTokenId: new anchor.BN(nextTokenId),
        maxSupply: new anchor.BN(maxSupply),
        mintedCount: new anchor.BN(mintedCount),
      })
      .accounts({
        authority: payer.publicKey,
        globalConfig,
        systemProgram,
      })
      .rpc();

    saveCache({
      ...cache,
      globalConfig: globalConfig.toBase58(),
    });

    console.log(`GLOBAL_CONFIG=${globalConfig.toBase58()}`);
    console.log(`MIGRATE_GLOBAL_CONFIG_SIGNATURE=${signature}`);
    console.log(`NEXT_TOKEN_ID=${nextTokenId}`);
    console.log(`MINTED_COUNT=${mintedCount}`);
    console.log(`MAX_SUPPLY=${maxSupply}`);
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error(error.message);
      const logs = await error.getLogs(provider.connection).catch(() => error.logs);
      console.error(logs?.join("\n") || "No transaction logs available.");
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
