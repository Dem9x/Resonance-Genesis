import { getProgram, getProvider, globalConfigPda, loadCache, programId, readGlobalConfig } from "./lib";

async function main() {
  const cache = loadCache();
  const { provider } = getProvider();
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();

  console.log(`PROGRAM_ID=${programId.toBase58()}`);
  console.log(`GLOBAL_CONFIG=${globalConfig.toBase58()}`);

  const accountInfo = await provider.connection.getAccountInfo(globalConfig);
  if (!accountInfo) {
    console.log("GLOBAL_CONFIG_STATUS=missing");
    console.log("Run npm run initialize after deploying the current program.");
  } else {
    try {
      const config = await readGlobalConfig(program, globalConfig);
      console.log("GLOBAL_CONFIG_STATUS=initialized");
      console.log(`NEXT_TOKEN_ID=${config.nextTokenId.toString()}`);
      console.log(`MINTED_COUNT=${config.mintedCount.toString()}`);
      console.log(`MAX_SUPPLY=${config.maxSupply.toString()}`);
      console.log(`RE_MINT=${config.reMint.toBase58()}`);
      console.log(`COLLECTION_MINT=${config.collectionMint.toBase58()}`);
    } catch (error) {
      console.log("GLOBAL_CONFIG_STATUS=incompatible-layout");
      console.log("The deployed GlobalConfig account may use the old layout. Redeploy/reinitialize the upgraded Devnet program.");
      console.log(`ERROR=${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const sampleNodes = cache.sampleNodes || [];
  console.log(`CACHE_SAMPLE_NODE_COUNT=${sampleNodes.length}`);
  if (sampleNodes.length > 0) {
    for (const node of sampleNodes.slice(-10)) {
      console.log(`CACHE_NODE_${node.tokenId}_MINT=${node.mint}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
