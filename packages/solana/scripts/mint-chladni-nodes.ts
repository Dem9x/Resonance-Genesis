import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";
import { createNftMetadata, getConnection, loadCache, loadPayer, metadataUriFor, saveCache, type CachedNode } from "./lib";

const DEFAULT_METADATA_DIR = path.resolve(process.cwd(), "..", "..", "output_scientific_collection_v3", "chladni-nodes", "metadata");
const DEFAULT_ONCHAIN_TRAITS_PATH = path.resolve(process.cwd(), "..", "..", "output_scientific_collection_v3", "chladni-nodes", "onchain-traits.json");

type MetadataFile = {
  name?: string;
  tokenId?: number;
};

type OnchainTraitsFile = {
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

function hashString(input: string) {
  return input.split("").reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function loadScientificTrait(tokenId: number, traitsPath: string) {
  const payload = readJson<OnchainTraitsFile>(traitsPath);
  if (!payload.tokenIds?.length || !payload.traits?.length) {
    throw new Error(`Invalid on-chain traits file: ${traitsPath}`);
  }
  const index = payload.tokenIds.indexOf(tokenId);
  if (index < 0) {
    throw new Error(`Token ${tokenId} not found in ${traitsPath}`);
  }
  const trait = payload.traits[index];
  const missing = [
    ["frequency", trait.frequency],
    ["modeN", trait.modeN],
    ["modeM", trait.modeM],
    ["nodeDensityBps", trait.nodeDensityBps],
    ["lineThicknessBps", trait.lineThicknessBps],
  ].filter(([, value]) => !Number(value));
  if (missing.length > 0) {
    throw new Error(`Token ${tokenId} has zero scientific traits: ${missing.map(([key]) => key).join(", ")}`);
  }
  return trait;
}

function loadMetadataName(tokenId: number, metadataDir: string) {
  const metadataPath = path.join(metadataDir, `${tokenId}.json`);
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Missing scientific metadata for token ${tokenId}: ${metadataPath}`);
  }
  const metadata = readJson<MetadataFile>(metadataPath);
  if (metadata.tokenId && Number(metadata.tokenId) !== tokenId) {
    throw new Error(`Metadata tokenId mismatch in ${metadataPath}`);
  }
  return metadata.name || `Chladni Node #${tokenId}`;
}

async function main() {
  const connection = getConnection();
  const payer = loadPayer();
  const count = Number(process.env.SAMPLE_NODE_COUNT || "3");
  const metadataDir = path.resolve(process.cwd(), process.env.SCIENTIFIC_METADATA_DIR || DEFAULT_METADATA_DIR);
  const traitsPath = path.resolve(process.cwd(), process.env.ONCHAIN_TRAITS_PATH || DEFAULT_ONCHAIN_TRAITS_PATH);
  const cache = loadCache();
  const existing = cache.sampleNodes || [];
  const sampleNodes: CachedNode[] = [...existing];
  const collectionMint = process.env.CHLADNI_COLLECTION_MINT || cache.collectionMint;

  if (!Number.isFinite(count) || count <= 0) throw new Error("SAMPLE_NODE_COUNT must be greater than 0");
  if (!fs.existsSync(metadataDir)) throw new Error(`Scientific metadata directory not found: ${metadataDir}`);
  if (!fs.existsSync(traitsPath)) throw new Error(`Scientific on-chain traits file not found: ${traitsPath}`);

  console.log(`Minting ${count} scientific Chladni Node NFT(s) from ${metadataDir}`);

  for (let i = 0; i < count; i += 1) {
    const tokenId = existing.length + i + 1;
    const name = loadMetadataName(tokenId, metadataDir);
    const trait = loadScientificTrait(tokenId, traitsPath);
    const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 0);
    const ownerAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    await mintTo(connection, payer, mint, ownerAta.address, payer, 1);

    const uri = metadataUriFor(tokenId);
    const metadata = await createNftMetadata({
      connection,
      payer,
      mint,
      name,
      symbol: "NODE",
      uri,
      collectionMint: collectionMint ? new PublicKey(collectionMint) : undefined,
    });

    sampleNodes.push({
      tokenId,
      mint: mint.toBase58(),
      ownerTokenAccount: ownerAta.address.toBase58(),
      metadata: metadata.metadata.toBase58(),
      masterEdition: metadata.masterEdition.toBase58(),
      metadataUri: uri,
      frequency: trait.frequency,
      modeN: trait.modeN,
      modeM: trait.modeM,
      nodeDensityBps: trait.nodeDensityBps,
      lineThicknessBps: trait.lineThicknessBps,
      rarityTier: trait.rarityTier,
      patternFamilyHash: hashString(`scientific-${tokenId}-${trait.modeN}-${trait.modeM}`),
    });

    console.log(`NODE_${tokenId}_MINT=${mint.toBase58()}`);
    console.log(`NODE_${tokenId}_TOKEN_ACCOUNT=${ownerAta.address.toBase58()}`);
    console.log(`NODE_${tokenId}_METADATA=${metadata.metadata.toBase58()}`);
    console.log(`NODE_${tokenId}_MASTER_EDITION=${metadata.masterEdition.toBase58()}`);
    console.log(`NODE_${tokenId}_METADATA_URI=${uri}`);
  }

  saveCache({ sampleNodes });
  console.log(`SAMPLE_NODE_COUNT=${sampleNodes.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
