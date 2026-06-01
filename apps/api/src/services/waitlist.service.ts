import { Collection, Db } from "mongodb";
import { waitlistCollectionName, type WaitlistEntry, type WaitlistStatus } from "../models/WaitlistEntry";
import type { WaitlistJoinBody } from "../validation/waitlist.schema";

export class WaitlistService {
  private entries: Collection<WaitlistEntry>;

  constructor(db: Db) {
    this.entries = db.collection<WaitlistEntry>(waitlistCollectionName);
  }

  async join(input: WaitlistJoinBody) {
    const walletAddress = clean(input.walletAddress);
    const email = clean(input.email);
    const xHandle = clean(input.xHandle);
    const duplicate = await this.entries.findOne({
      $or: [
        walletAddress ? { walletAddress } : undefined,
        email ? { email } : undefined
      ].filter(Boolean) as Record<string, string>[]
    });
    if (duplicate) return { entry: duplicate, alreadyJoined: true };

    const now = new Date();
    const entry: WaitlistEntry = {
      walletAddress,
      email,
      xHandle,
      discord: clean(input.discord),
      referralCode: referralCode(walletAddress || email || xHandle),
      referredBy: clean(input.referredBy),
      status: "pending",
      position: (await this.entries.countDocuments()) + 1,
      source: clean(input.source) || "waitlist-page",
      selectedTheme: clean(input.selectedTheme),
      createdAt: now,
      updatedAt: now
    };
    await this.entries.insertOne(entry);
    return { entry, alreadyJoined: false };
  }

  async stats(targetSlots: number, launchTimestamp: string) {
    const [totalJoined, totalInvited] = await Promise.all([
      this.entries.countDocuments(),
      this.entries.countDocuments({ status: "invited" })
    ]);
    return {
      totalJoined,
      totalInvited,
      remainingSlots: Math.max(0, targetSlots - totalJoined),
      currentPhase: totalJoined >= targetSlots ? "queue-locked" : "early-access",
      launchTimestamp,
      targetSlots
    };
  }

  async updateStatus(id: string, status: WaitlistStatus) {
    return this.entries.updateOne({ referralCode: id }, { $set: { status, updatedAt: new Date() } });
  }
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function referralCode(seed?: string) {
  const prefix = (seed || "RE").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "RE";
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
