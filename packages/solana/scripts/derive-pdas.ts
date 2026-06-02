import { globalConfigPda, nodeTraitsPda, programId, reMintAuthorityPda, stakePda, vaultAuthorityPda } from "./lib";
import { PublicKey } from "@solana/web3.js";

console.log("program", programId.toBase58());
console.log("globalConfig", globalConfigPda()[0].toBase58());
console.log("reMintAuthority", reMintAuthorityPda()[0].toBase58());
console.log("vaultAuthority", vaultAuthorityPda()[0].toBase58());

if (process.env.NFT_MINT) {
  const nftMint = new PublicKey(process.env.NFT_MINT);
  console.log("nodeTraits", nodeTraitsPda(nftMint)[0].toBase58());
  console.log("stake", stakePda(nftMint)[0].toBase58());
}

