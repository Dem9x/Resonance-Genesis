import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  getConnection,
  getProgram,
  getProvider,
  globalConfigPda,
  loadCache,
  nodeTraitsPda,
  reMintAuthorityPda,
  stakePda,
} from "./lib";

async function main() {
  const cache = loadCache();
  const nftMintAddress = process.env.NFT_MINT || cache.sampleNodes?.[0]?.mint;
  const reMintAddress = process.env.RE_MINT_ADDRESS || cache.reMintAddress;
  if (!nftMintAddress) {
    throw new Error("Missing NFT_MINT. Export NFT_MINT or run npm run mint-samples first.");
  }
  if (!reMintAddress) {
    throw new Error("Missing RE_MINT_ADDRESS. Export RE_MINT_ADDRESS or run npm run create-re-token first.");
  }

  const nftMint = new PublicKey(nftMintAddress);
  const reMint = new PublicKey(reMintAddress);
  const connection = getConnection();
  const { payer, provider } = getProvider();
  const program = getProgram(provider);
  const userReAccount = await getOrCreateAssociatedTokenAccount(connection, payer, reMint, payer.publicKey);
  const [globalConfig] = globalConfigPda();
  const [nodeTraits] = nodeTraitsPda(nftMint);
  const [stakeAccount] = stakePda(nftMint);
  const [reMintAuthority] = reMintAuthorityPda();

  const signature = await program.methods
    .claimRe()
    .accounts({
      owner: payer.publicKey,
      globalConfig,
      reMint,
      userReAccount: userReAccount.address,
      nodeTraits,
      stakeAccount,
      reMintAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  console.log(`NFT_MINT=${nftMint.toBase58()}`);
  console.log(`USER_RE_ACCOUNT=${userReAccount.address.toBase58()}`);
  console.log(`CLAIM_RE_SIGNATURE=${signature}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
