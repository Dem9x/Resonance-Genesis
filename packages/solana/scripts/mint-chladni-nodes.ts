import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";
import {
  configuredCreatorAddress,
  configuredRoyaltyBps,
  createNftMetadata,
  getConnection,
  getProgram,
  getProvider,
  globalConfigPda,
  loadCache,
  loadPayer,
  metadataUriFor,
  mintRecordPda,
  nodeTraitsPda,
  readGlobalConfig,
  saveCache,
  systemProgram,
  validateNftMetadata,
  type CachedNode,
} from "./lib";

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

function hashUriToU32(input: string) {
  return hashString(input) >>> 0;
}

function bnToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (value && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
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

function shouldChargeMintPrice() {
  return process.argv.includes("--charge-mint-price");
}

async function sendPrimaryMintPayment({
  connection,
  payer,
  treasury,
  lamports,
}: {
  connection: ReturnType<typeof getConnection>;
  payer: ReturnType<typeof loadPayer>;
  treasury: PublicKey;
  lamports: number;
}) {
  if (lamports <= 0) return undefined;
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: treasury,
      lamports,
    }),
  );
  return sendAndConfirmTransaction(connection, tx, [payer], { commitment: "confirmed" });
}

async function main() {
  const { payer, provider } = getProvider();
  const connection = provider.connection;
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();
  const count = Number(process.env.SAMPLE_NODE_COUNT || "3");
  const metadataDir = path.resolve(process.cwd(), process.env.SCIENTIFIC_METADATA_DIR || DEFAULT_METADATA_DIR);
  const traitsPath = path.resolve(process.cwd(), process.env.ONCHAIN_TRAITS_PATH || DEFAULT_ONCHAIN_TRAITS_PATH);
  const cache = loadCache();
  const existing = cache.sampleNodes || [];
  const sampleNodes: CachedNode[] = [...existing];
  const collectionMint = process.env.CHLADNI_COLLECTION_MINT || cache.collectionMint;
  const creatorWallet = new PublicKey(process.env.CREATOR_WALLET || configuredCreatorAddress);
  const royaltyBps = Number(process.env.NFT_ROYALTY_BPS || configuredRoyaltyBps || 500);
  const chargeMintPrice = shouldChargeMintPrice();
  const mintPriceLamports = Number(process.env.MINT_PRICE_LAMPORTS || "10000000");
  const creatorTreasury = process.env.CREATOR_TREASURY ? new PublicKey(process.env.CREATOR_TREASURY) : creatorWallet;

  if (!Number.isFinite(count) || count <= 0) throw new Error("SAMPLE_NODE_COUNT must be greater than 0");
  if (!Number.isFinite(royaltyBps) || royaltyBps < 0 || royaltyBps > 10_000) throw new Error("NFT_ROYALTY_BPS must be between 0 and 10000");
  if (!Number.isFinite(mintPriceLamports) || mintPriceLamports < 0) throw new Error("MINT_PRICE_LAMPORTS must be zero or greater");
  if (!fs.existsSync(metadataDir)) throw new Error(`Scientific metadata directory not found: ${metadataDir}`);
  if (!fs.existsSync(traitsPath)) throw new Error(`Scientific on-chain traits file not found: ${traitsPath}`);

  console.log(`Minting ${count} scientific Chladni Node NFT(s) from ${metadataDir}`);
  console.log(`CREATOR_WALLET=${creatorWallet.toBase58()}`);
  console.log(`NFT_ROYALTY_BPS=${royaltyBps}`);
  console.log(`CREATOR_TREASURY=${creatorTreasury.toBase58()}`);
  console.log(`MINT_PRICE_LAMPORTS=${mintPriceLamports}`);
  console.log(`CHARGE_MINT_PRICE=${chargeMintPrice ? "true" : "false"}`);

  for (let i = 0; i < count; i += 1) {
    let globalState;
    try {
      globalState = await readGlobalConfig(program, globalConfig);
    } catch (error) {
      throw new Error(`Unable to read GlobalConfig. Run npm run initialize after deploying the upgraded program. Details: ${error instanceof Error ? error.message : String(error)}`);
    }

    const tokenId = bnToNumber(globalState.nextTokenId);
    const mintedCount = globalState.mintedCount?.toString?.() || "unknown";
    const maxSupply = globalState.maxSupply?.toString?.() || "unknown";
    if (!Number.isFinite(tokenId) || tokenId <= 0) throw new Error(`Invalid on-chain nextTokenId: ${globalState.nextTokenId}`);
    console.log(`ONCHAIN_NEXT_TOKEN_ID=${tokenId}`);
    console.log(`ONCHAIN_MINTED_COUNT=${mintedCount}`);
    console.log(`ONCHAIN_MAX_SUPPLY=${maxSupply}`);

    const name = loadMetadataName(tokenId, metadataDir);
    const trait = loadScientificTrait(tokenId, traitsPath);
    const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 0);
    const ownerAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    await mintTo(connection, payer, mint, ownerAta.address, payer, 1);
    if (chargeMintPrice) {
      const paymentSignature = await sendPrimaryMintPayment({ connection, payer, treasury: creatorTreasury, lamports: mintPriceLamports });
      console.log(`NODE_${tokenId}_PRIMARY_PAYMENT_SIGNATURE=${paymentSignature}`);
    }

    const uri = metadataUriFor(tokenId);
    const metadata = await createNftMetadata({
      connection,
      payer,
      mint,
      name,
      symbol: "NODE",
      uri,
      collectionMint: collectionMint ? new PublicKey(collectionMint) : undefined,
      creatorAddress: creatorWallet,
      sellerFeeBasisPoints: royaltyBps,
    });

    const [mintRecord] = mintRecordPda(tokenId);
    const [nodeTraits] = nodeTraitsPda(mint);
    try {
      await program.methods
        .registerNodeMint({
          tokenId: new anchor.BN(tokenId),
          nftMint: mint,
          metadataUriHash: hashUriToU32(uri),
          frequency: trait.frequency,
          modeN: trait.modeN,
          modeM: trait.modeM,
          nodeDensityBps: trait.nodeDensityBps,
          lineThicknessBps: trait.lineThicknessBps,
          rarityTier: trait.rarityTier,
          patternFamilyHash: hashString(`scientific-${tokenId}-${trait.modeN}-${trait.modeM}`),
        })
        .accounts({
          owner: payer.publicKey,
          globalConfig,
          nftMint: mint,
          mintRecord,
          nodeTraits,
          systemProgram,
        })
        .rpc();
    } catch (error) {
      console.error(`REGISTER_NODE_MINT_FAILED_TOKEN_${tokenId}=${error instanceof Error ? error.message : String(error)}`);
      const latestState = await readGlobalConfig(program, globalConfig).catch(() => undefined);
      const latestTokenId = latestState ? bnToNumber(latestState.nextTokenId) : tokenId;
      if (latestTokenId > tokenId) {
        console.error(`ONCHAIN_NEXT_TOKEN_ID_ADVANCED=${latestTokenId}`);
        console.error("No cache entry was saved for this local SPL mint. Continuing from the on-chain counter.");
        continue;
      }
      console.error("The SPL mint may exist, but no cache entry was saved. Re-run the script; it will refetch on-chain nextTokenId.");
      throw error;
    }

    const metadataValidation = await validateNftMetadata({
      connection,
      metadata: metadata.metadata,
      expectedCreator: creatorWallet,
      expectedSellerFeeBasisPoints: royaltyBps,
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
    console.log(`NODE_${tokenId}_MINT_RECORD=${mintRecord.toBase58()}`);
    console.log(`NODE_${tokenId}_METADATA_URI=${uri}`);
    console.log(`NODE_${tokenId}_ROYALTY_BPS=${metadataValidation.sellerFeeBasisPoints}`);
    console.log(`NODE_${tokenId}_CREATOR=${metadataValidation.creator}`);
    console.log(`NODE_${tokenId}_CREATOR_SHARE=${metadataValidation.creatorShare}`);
    console.log(`NODE_${tokenId}_CREATOR_VERIFIED=${metadataValidation.creatorVerified}`);
  }

  saveCache({ sampleNodes });
  console.log(`SAMPLE_NODE_COUNT=${sampleNodes.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
