import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";
import { getProgram, getProvider, globalConfigPda, loadCache, nodeTraitsPda, systemProgram } from "./lib";

const DEFAULT_ONCHAIN_TRAITS_PATH = path.resolve(
  process.cwd(),
  "..",
  "..",
  "output_scientific_collection_v3",
  "chladni-nodes",
  "onchain-traits.json",
);

type TraitInput = {
  tokenId: number;
  mint: string;
  frequency: number;
  modeN: number;
  modeM: number;
  nodeDensityBps: number;
  lineThicknessBps: number;
  rarityTier: number;
  patternFamilyHash: number;
};

function hashString(input: string) {
  return input.split("").reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7);
}

function validateTrait(node: TraitInput) {
  const missing = [
    ["frequency", node.frequency],
    ["modeN", node.modeN],
    ["modeM", node.modeM],
    ["nodeDensityBps", node.nodeDensityBps],
    ["lineThicknessBps", node.lineThicknessBps],
  ].filter(([, value]) => !Number(value));

  if (missing.length > 0) {
    throw new Error(`Token ${node.tokenId} has invalid zero trait values: ${missing.map(([key]) => key).join(", ")}`);
  }
}

function loadScientificTraits(): TraitInput[] | undefined {
  const requestedPath = process.env.ONCHAIN_TRAITS_PATH;
  const traitsPath = requestedPath || DEFAULT_ONCHAIN_TRAITS_PATH;
  if (!fs.existsSync(traitsPath)) {
    if (requestedPath) throw new Error(`ONCHAIN_TRAITS_PATH does not exist: ${traitsPath}`);
    return undefined;
  }

  const resolved = path.resolve(process.cwd(), traitsPath);
  const payload = JSON.parse(fs.readFileSync(resolved, "utf8")) as {
    tokenIds?: number[];
    traits?: Array<{
      frequency: number;
      modeN: number;
      modeM: number;
      nodeDensityBps: number;
      lineThicknessBps: number;
      rarityTier: number;
      initialized: boolean;
    }>;
  };
  const mints = (process.env.NFT_MINTS || process.env.NFT_MINT || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!payload.tokenIds?.length || !payload.traits?.length) {
    throw new Error(`Invalid onchain traits file: ${resolved}`);
  }
  if (mints.length === 0) {
    if (requestedPath) throw new Error("ONCHAIN_TRAITS_PATH requires NFT_MINTS=mint1,mint2,... or NFT_MINT=mint");
    return undefined;
  }
  if (mints.length !== payload.traits.length && mints.length !== 1) {
    throw new Error(`NFT_MINTS count ${mints.length} must equal traits count ${payload.traits.length}, or use one NFT_MINT for one trait.`);
  }

  const singleTokenId = Number(process.env.TRAIT_TOKEN_ID || payload.tokenIds[0]);
  return mints.map((mint, index) => {
    const traitIndex = mints.length === 1 ? Math.max(0, payload.tokenIds!.indexOf(singleTokenId)) : index;
    const trait = payload.traits![traitIndex] || payload.traits![0];
    const tokenId = mints.length === 1 ? singleTokenId : payload.tokenIds![index];
    const node = {
      tokenId,
      mint,
      frequency: trait.frequency,
      modeN: trait.modeN,
      modeM: trait.modeM,
      nodeDensityBps: trait.nodeDensityBps,
      lineThicknessBps: trait.lineThicknessBps,
      rarityTier: trait.rarityTier,
      patternFamilyHash: hashString(`scientific-${tokenId}-${trait.modeN}-${trait.modeM}`),
    };
    validateTrait(node);
    return node;
  });
}

function loadCacheTraits(): TraitInput[] {
  const cache = loadCache();
  return (cache.sampleNodes || []).map((node) => ({
    tokenId: node.tokenId,
    mint: node.mint,
    frequency: node.frequency,
    modeN: node.modeN,
    modeM: node.modeM,
    nodeDensityBps: node.nodeDensityBps,
    lineThicknessBps: node.lineThicknessBps,
    rarityTier: node.rarityTier,
    patternFamilyHash: node.patternFamilyHash,
  }));
}

async function main() {
  const nodes = loadScientificTraits() || loadCacheTraits();
  if (nodes.length === 0) {
    throw new Error("No traits found. Run npm run mint-samples first, or set ONCHAIN_TRAITS_PATH plus NFT_MINTS.");
  }
  nodes.forEach(validateTrait);

  const { payer, provider } = getProvider();
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();

  console.log(`SETTING_TRAITS_COUNT=${nodes.length}`);
  const signatures: string[] = [];

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
    signatures.push(signature);
  }

  console.log(`TRAITS_SET_COUNT=${nodes.length}`);
  console.log(`TRAITS_SET_SIGNATURES=${signatures.join(",")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
