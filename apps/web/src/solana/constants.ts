import { PublicKey } from "@solana/web3.js";

export const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
export const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
export const solanaExplorerCluster = process.env.NEXT_PUBLIC_SOLANA_EXPLORER_CLUSTER || "devnet";
export const resonanceProgramId = process.env.NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID || "";
export const reMintAddress = process.env.NEXT_PUBLIC_RE_MINT_ADDRESS || "";
export const chladniCollectionMint = process.env.NEXT_PUBLIC_CHLADNI_COLLECTION_MINT || "";
export const solanaCreatorAddress = process.env.NEXT_PUBLIC_SOLANA_CREATOR_ADDRESS || "2ryR7rmGYP2pcjv6WWLTG3Ats3RpfKshkZ5EJTMeMCzC";
export const solanaCreatorTreasury = process.env.NEXT_PUBLIC_CREATOR_TREASURY || solanaCreatorAddress;
export const nftRoyaltyBps = Number(process.env.NEXT_PUBLIC_NFT_ROYALTY_BPS || "500");
export const mintPriceSol = Number(process.env.NEXT_PUBLIC_MINT_PRICE_SOL || "0.01");
export const mintPriceLamports = Math.round(mintPriceSol * 1_000_000_000);
export const solanaMetadataCid = process.env.NEXT_PUBLIC_METADATA_CID || "";
export const solanaMetadataBaseUri = process.env.NEXT_PUBLIC_SOLANA_METADATA_BASE_URI || "";
export const solanaImageCid = process.env.NEXT_PUBLIC_SOLANA_IMAGE_CID || process.env.NEXT_PUBLIC_IMAGE_CID || "";
export const solanaMintMetadataTokenId = Number(process.env.NEXT_PUBLIC_SOLANA_MINT_METADATA_TOKEN_ID || "1");
export const solanaImageFallbackCount = Number(process.env.NEXT_PUBLIC_SOLANA_IMAGE_FALLBACK_COUNT || "20");

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
