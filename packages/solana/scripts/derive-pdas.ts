import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey(process.env.RESONANCE_SOLANA_PROGRAM_ID || process.env.NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID || "ReSo111111111111111111111111111111111111111");

export function globalConfigPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("global_config")], programId);
}

export function reMintAuthorityPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("re_mint_authority")], programId);
}

export function vaultAuthorityPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("vault_authority")], programId);
}

export function nodeTraitsPda(nftMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("node_traits"), nftMint.toBuffer()], programId);
}

export function stakePda(nftMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("stake"), nftMint.toBuffer()], programId);
}

if (require.main === module) {
  console.log("program", programId.toBase58());
  console.log("globalConfig", globalConfigPda()[0].toBase58());
  console.log("reMintAuthority", reMintAuthorityPda()[0].toBase58());
  console.log("vaultAuthority", vaultAuthorityPda()[0].toBase58());
}
