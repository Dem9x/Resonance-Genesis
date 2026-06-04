import { PublicKey } from "@solana/web3.js";
import { optionalPublicKey, resonanceProgramId } from "@/solana/constants";

const programId = optionalPublicKey(resonanceProgramId);

function derive(seeds: Buffer[]) {
  if (!programId) return undefined;
  return PublicKey.findProgramAddressSync(seeds, programId)[0];
}

export function globalConfigPda() {
  return derive([Buffer.from("global_config")]);
}

export function reMintAuthorityPda() {
  return derive([Buffer.from("re_mint_authority")]);
}

export function vaultAuthorityPda() {
  return derive([Buffer.from("vault_authority")]);
}

export function nodeTraitsPda(nftMint: PublicKey) {
  return derive([Buffer.from("node_traits"), nftMint.toBuffer()]);
}

export function stakePda(nftMint: PublicKey) {
  return derive([Buffer.from("stake"), nftMint.toBuffer()]);
}

export function tokenIdToLeBytes(tokenId: number | bigint) {
  const value = typeof tokenId === "bigint" ? tokenId : BigInt(tokenId);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(value);
  return buffer;
}

export function mintRecordPda(tokenId: number | bigint) {
  return derive([Buffer.from("mint_record"), tokenIdToLeBytes(tokenId)]);
}
