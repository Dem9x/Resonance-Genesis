import { PublicKey } from "@solana/web3.js";

export const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
export const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
export const solanaExplorerCluster = process.env.NEXT_PUBLIC_SOLANA_EXPLORER_CLUSTER || "devnet";
export const resonanceProgramId = process.env.NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID || "";
export const reMintAddress = process.env.NEXT_PUBLIC_RE_MINT_ADDRESS || "";
export const chladniCollectionMint = process.env.NEXT_PUBLIC_CHLADNI_COLLECTION_MINT || "";

export const minClaimRe = 33;
export const reDecimals = 9;
export const maxReSupply = 1_000_000_000;

export function optionalPublicKey(value: string) {
  try {
    return value ? new PublicKey(value) : undefined;
  } catch {
    return undefined;
  }
}
