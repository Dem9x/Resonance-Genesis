import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { createNftMetadata, getConnection, loadCache, loadPayer, metadataUriFor, saveCache, type CachedNode } from "./lib";

const families = ["Diamond Mesh", "Radial Bloom", "Bridge Mesh", "Harmonic Lattice", "Aurora Plate"];

function traitFor(index: number) {
  const frequency = [174, 285, 396, 417, 528, 639, 741, 852, 963, 1515][index % 10];
  const modeN = 3 + (index % 7);
  const modeM = 4 + ((index * 2) % 8);
  const nodeDensityBps = 700 + index * 37;
  const lineThicknessBps = 90 + (index % 9) * 8;
  const rarityTier = index % 12 === 0 ? 4 : index % 7 === 0 ? 3 : index % 4 === 0 ? 2 : index % 2 === 0 ? 1 : 0;
  const patternFamilyHash = families[index % families.length]
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);

  return { frequency, modeN, modeM, nodeDensityBps, lineThicknessBps, rarityTier, patternFamilyHash };
}

async function main() {
  const connection = getConnection();
  const payer = loadPayer();
  const count = Number(process.env.SAMPLE_NODE_COUNT || "3");
  const cache = loadCache();
  const existing = cache.sampleNodes || [];
  const sampleNodes: CachedNode[] = [...existing];
  const collectionMint = process.env.CHLADNI_COLLECTION_MINT || cache.collectionMint;

  for (let i = 0; i < count; i += 1) {
    const tokenId = existing.length + i + 1;
    const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 0);
    const ownerAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    await mintTo(connection, payer, mint, ownerAta.address, payer, 1);

    const traits = traitFor(tokenId);
    const uri = metadataUriFor(tokenId);
    const metadata = await createNftMetadata({
      connection,
      payer,
      mint,
      name: `Chladni Node #${tokenId}`,
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
      ...traits,
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
