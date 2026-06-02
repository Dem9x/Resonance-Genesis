import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  getProgram,
  getProvider,
  globalConfigPda,
  loadCache,
  nodeTraitsPda,
  stakePda,
  systemProgram,
  vaultAuthorityPda,
} from "./lib";

async function main() {
  const cache = loadCache();
  const nftMintAddress = process.env.NFT_MINT || cache.sampleNodes?.[0]?.mint;
  if (!nftMintAddress) {
    throw new Error("Missing NFT_MINT. Export NFT_MINT or run npm run mint-samples first.");
  }

  const nftMint = new PublicKey(nftMintAddress);
  const { payer, provider } = getProvider();
  const program = getProgram(provider);
  const [globalConfig] = globalConfigPda();
  const [nodeTraits] = nodeTraitsPda(nftMint);
  const [vaultNftAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), nftMint.toBuffer()],
    program.programId,
  );
  const [vaultAuthority] = vaultAuthorityPda();
  const [stakeAccount] = stakePda(nftMint);
  const userNftAccount = getAssociatedTokenAddressSync(nftMint, payer.publicKey);

  const signature = await program.methods
    .stakeNode()
    .accounts({
      owner: payer.publicKey,
      globalConfig,
      nftMint,
      nodeTraits,
      userNftAccount,
      vaultNftAccount,
      vaultAuthority,
      stakeAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log(`NFT_MINT=${nftMint.toBase58()}`);
  console.log(`STAKE_ACCOUNT=${stakeAccount.toBase58()}`);
  console.log(`VAULT_NFT_ACCOUNT=${vaultNftAccount.toBase58()}`);
  console.log(`STAKE_SIGNATURE=${signature}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

