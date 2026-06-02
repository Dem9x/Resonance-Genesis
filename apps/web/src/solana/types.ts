export type SolanaNodeTraits = {
  nftMint: string;
  frequency: number;
  modeN: number;
  modeM: number;
  nodeDensityBps: number;
  lineThicknessBps: number;
  rarityTier: number;
  initialized: boolean;
};

export type SolanaStakeState = {
  owner: string;
  nftMint: string;
  stakedAt: number;
  lastClaimAt: number;
  claimedRe: number;
  active: boolean;
};

export type SolanaNode = {
  mint: string;
  name?: string;
  image?: string;
  metadataUri?: string;
  traits?: SolanaNodeTraits;
  stake?: SolanaStakeState;
  claimableRe?: number;
  hashrate?: number;
  tokenAccount?: string;
  metadataAddress?: string;
  status?: "Owned" | "Staked" | "Unknown";
};
