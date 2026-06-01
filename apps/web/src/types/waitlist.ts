export type WaitlistStatus = "pending" | "confirmed" | "invited";

export type WaitlistInterest = "Mint" | "Staking" | "Miner Utility" | "Chladni Art" | "Developer Updates";

export type WaitlistEntry = {
  id?: string;
  walletAddress?: string;
  email?: string;
  xHandle?: string;
  discord?: string;
  referralCode: string;
  referredBy?: string;
  status: WaitlistStatus;
  position: number;
  source?: string;
  selectedTheme?: string;
  selectedInterest?: WaitlistInterest;
  createdAt: string;
  updatedAt: string;
};

export type WaitlistJoinInput = {
  walletAddress?: string;
  email?: string;
  xHandle?: string;
  discord?: string;
  referredBy?: string;
  source?: string;
  selectedTheme?: string;
  selectedInterest?: WaitlistInterest;
};

export type WaitlistJoinResponse = {
  entry: WaitlistEntry;
  alreadyJoined?: boolean;
};

export type WaitlistStats = {
  totalJoined: number;
  totalInvited: number;
  remainingSlots: number;
  currentPhase: string;
  launchTimestamp: string;
  targetSlots: number;
};
