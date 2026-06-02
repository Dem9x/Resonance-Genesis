import { createMint } from "@solana/spl-token";
import { getConnection, loadPayer, reMintAuthorityPda, saveCache } from "./lib";

async function main() {
  const connection = getConnection();
  const payer = loadPayer();
  const [mintAuthority] = reMintAuthorityPda();
  const mint = await createMint(connection, payer, mintAuthority, null, 9);

  saveCache({
    reMintAddress: mint.toBase58(),
    reMintAuthorityPda: mintAuthority.toBase58(),
  });

  console.log(`RE_MINT_ADDRESS=${mint.toBase58()}`);
  console.log(`RE_MINT_AUTHORITY_PDA=${mintAuthority.toBase58()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
