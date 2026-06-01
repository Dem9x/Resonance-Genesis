export type WaitlistStatus = "pending" | "confirmed" | "invited";

export type WaitlistEntry = {
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
  createdAt: Date;
  updatedAt: Date;
};

export const waitlistCollectionName = "waitlistEntries";
