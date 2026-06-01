export type WaitlistJoinBody = {
  walletAddress?: string;
  email?: string;
  xHandle?: string;
  discord?: string;
  referredBy?: string;
  source?: string;
  selectedTheme?: string;
};

export function validateWaitlistJoin(body: WaitlistJoinBody) {
  if (!body.walletAddress?.trim() && !body.email?.trim() && !body.xHandle?.trim()) {
    return "At least one of walletAddress, email, or xHandle is required.";
  }
  return undefined;
}
