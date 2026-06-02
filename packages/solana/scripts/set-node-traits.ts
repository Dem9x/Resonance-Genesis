import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getProgram, getProvider, globalConfigPda, loadCache, nodeTraitsPda, systemProgram } from "./lib";

async function main() {
  const cache = loadCache();
  const nodes = cache.sampleNodes || [];
  if (nodes.length === 0) {
    throw new Error("No sample nodes found in .cache/solana-devnet.json. Run npm run mint-samples first.");
  }

  const { payer, provider } = getProvider();
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();

  for (const node of nodes) {
    const nftMint = new PublicKey(node.mint);
    const [nodeTraits] = nodeTraitsPda(nftMint);
    const signature = await program.methods
      .setNodeTraits({
        nftMint,
        frequency: node.frequency,
        modeN: node.modeN,
        modeM: node.modeM,
        nodeDensityBps: node.nodeDensityBps,
        lineThicknessBps: node.lineThicknessBps,
        rarityTier: node.rarityTier,
        patternFamilyHash: node.patternFamilyHash,
      })
      .accounts({
        authority: payer.publicKey,
        globalConfig,
        nodeTraits,
        systemProgram,
      })
      .rpc();

    console.log(`NODE_${node.tokenId}_TRAITS_PDA=${nodeTraits.toBase58()}`);
    console.log(`NODE_${node.tokenId}_SET_TRAITS_SIGNATURE=${signature}`);
  }

  console.log(`TRAITS_SET_COUNT=${nodes.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
