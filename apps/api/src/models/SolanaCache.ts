export type SolanaNftMetadataCache = {
  mint: string;
  metadataUri?: string;
  name?: string;
  image?: string;
  updatedAt: Date;
};

export type SolanaStakeEvent = {
  signature: string;
  wallet: string;
  mint: string;
  eventType: "stake" | "unstake";
  slot?: number;
  createdAt: Date;
};

export type SolanaReEvent = {
  signature: string;
  wallet: string;
  mint: string;
  amount: string;
  slot?: number;
  createdAt: Date;
};

export type SolanaNodeTraitsCache = {
  mint: string;
  frequency: number;
  modeN: number;
  modeM: number;
  nodeDensityBps: number;
  lineThicknessBps: number;
  rarityTier: number;
  updatedAt: Date;
};
