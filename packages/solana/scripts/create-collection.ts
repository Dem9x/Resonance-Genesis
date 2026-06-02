import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { collectionMetadataUri, createNftMetadata, getConnection, loadPayer, saveCache } from "./lib";

async function main() {
  const connection = getConnection();
  const payer = loadPayer();
  const collectionMint = await createMint(connection, payer, payer.publicKey, null, 0);
  const collectionAta = await getOrCreateAssociatedTokenAccount(connection, payer, collectionMint, payer.publicKey);

  await mintTo(connection, payer, collectionMint, collectionAta.address, payer, 1);
  const uri = collectionMetadataUri();
  const metadata = await createNftMetadata({
    connection,
    payer,
    mint: collectionMint,
    name: "Resonance Genesis",
    symbol: "NODE",
    uri,
  });

  saveCache({
    collectionMint: collectionMint.toBase58(),
    collectionTokenAccount: collectionAta.address.toBase58(),
    collectionMetadata: metadata.metadata.toBase58(),
    collectionMasterEdition: metadata.masterEdition.toBase58(),
    collectionMetadataUri: uri,
  });

  console.log(`CHLADNI_COLLECTION_MINT=${collectionMint.toBase58()}`);
  console.log(`CHLADNI_COLLECTION_TOKEN_ACCOUNT=${collectionAta.address.toBase58()}`);
  console.log(`CHLADNI_COLLECTION_METADATA=${metadata.metadata.toBase58()}`);
  console.log(`CHLADNI_COLLECTION_MASTER_EDITION=${metadata.masterEdition.toBase58()}`);
  console.log(`CHLADNI_COLLECTION_METADATA_URI=${uri}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
