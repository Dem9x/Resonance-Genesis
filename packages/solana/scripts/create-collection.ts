import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { getConnection, loadPayer, saveCache } from "./lib";

async function main() {
  const connection = getConnection();
  const payer = loadPayer();
  const collectionMint = await createMint(connection, payer, payer.publicKey, null, 0);
  const collectionAta = await getOrCreateAssociatedTokenAccount(connection, payer, collectionMint, payer.publicKey);

  await mintTo(connection, payer, collectionMint, collectionAta.address, payer, 1);

  saveCache({
    collectionMint: collectionMint.toBase58(),
    collectionTokenAccount: collectionAta.address.toBase58(),
  });

  console.log(`CHLADNI_COLLECTION_MINT=${collectionMint.toBase58()}`);
  console.log(`CHLADNI_COLLECTION_TOKEN_ACCOUNT=${collectionAta.address.toBase58()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
