export type ChladniNode = {
  tokenId: number;
  name: string;
  image: string;
  frequency: number;
  modeN: number;
  modeM: number;
  patternFamily: string;
  backgroundGradient: string;
  nodeArchitecture: string;
  rarityTier: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  isStaked: boolean;
  miningStatus: "Idle" | "Mining" | "Cooling Down";
  resonanceEnergy: number;
  energyPerDay: number;
};

export type RarityTier = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";

export type NodeTraits = {
  frequency: number;
  modeN: number;
  modeM: number;
  nodeDensityBps: number;
  lineThicknessBps: number;
  rarityTier: number;
};

export type NodeAttribute = {
  trait_type: string;
  value: string | number;
};

export type ChladniMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: NodeAttribute[];
};

export type ContractNode = {
  tokenId: bigint;
  metadata?: ChladniMetadata;
  tokenUri?: string;
  traits?: NodeTraits;
  owner?: `0x${string}`;
  isStaked?: boolean;
  stakedOwner?: `0x${string}`;
  hashrate?: bigint;
  pendingEnergy?: bigint;
};
