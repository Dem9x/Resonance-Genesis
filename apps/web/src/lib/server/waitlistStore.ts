import { ObjectId, type Collection, type Document, type WithId } from "mongodb";
import { getAppDb } from "@/lib/server/mongo";
import type { WaitlistEntry, WaitlistJoinInput, WaitlistStats, WaitlistStatus } from "@/types/waitlist";

type WaitlistDocument = Omit<WaitlistEntry, "id" | "createdAt" | "updatedAt"> & {
  walletAddressNormalized?: string;
  emailNormalized?: string;
  createdAt: Date;
  updatedAt: Date;
};

const targetSlots = Number(process.env.WAITLIST_TARGET_SLOTS || process.env.NEXT_PUBLIC_WAITLIST_TARGET_SLOTS || 1000);
const launchTimestamp = process.env.WAITLIST_TARGET_DATE || process.env.NEXT_PUBLIC_WAITLIST_TARGET_DATE || "2026-06-30T12:00:00Z";

async function collection(): Promise<Collection<WaitlistDocument>> {
  const db = await getAppDb();
  const entries = db.collection<WaitlistDocument>("waitlistEntries");
  await entries.createIndex({ walletAddressNormalized: 1 }, { unique: true, sparse: true });
  await entries.createIndex({ emailNormalized: 1 }, { unique: true, sparse: true });
  await entries.createIndex({ referralCode: 1 }, { unique: true });
  await entries.createIndex({ position: 1 });
  return entries;
}

export async function joinWaitlist(input: WaitlistJoinInput) {
  const walletAddress = clean(input.walletAddress);
  const email = clean(input.email);
  const xHandle = clean(input.xHandle);

  if (!walletAddress && !email && !xHandle) {
    return { status: 400, body: { error: "Provide at least wallet address, email, or X handle." } };
  }

  const entries = await collection();
  const walletAddressNormalized = walletAddress?.toLowerCase();
  const emailNormalized = email?.toLowerCase();
  const duplicateQuery = [
    walletAddressNormalized ? { walletAddressNormalized } : undefined,
    emailNormalized ? { emailNormalized } : undefined
  ].filter(Boolean) as Document[];

  const existing = duplicateQuery.length ? await entries.findOne({ $or: duplicateQuery }) : null;
  if (existing) {
    return { status: 409, body: { entry: serialize(existing), alreadyJoined: true } };
  }

  const now = new Date();
  const position = (await entries.countDocuments()) + 1;
  const document: WaitlistDocument = {
    walletAddress,
    walletAddressNormalized,
    email,
    emailNormalized,
    xHandle,
    discord: clean(input.discord),
    referralCode: referralCode(walletAddress || email || xHandle),
    referredBy: clean(input.referredBy),
    status: "pending",
    position,
    source: clean(input.source) || "waitlist-page",
    selectedTheme: clean(input.selectedTheme),
    selectedInterest: input.selectedInterest,
    createdAt: now,
    updatedAt: now
  };

  const result = await entries.insertOne(document);
  return { status: 201, body: { entry: serialize({ ...document, _id: result.insertedId }), alreadyJoined: false } };
}

export async function waitlistStatus(wallet?: string, email?: string) {
  const entries = await collection();
  const query = wallet
    ? { walletAddressNormalized: wallet.toLowerCase() }
    : email
      ? { emailNormalized: email.toLowerCase() }
      : undefined;

  if (!query) return { status: 400, body: { error: "wallet or email query is required." } };
  const entry = await entries.findOne(query);
  if (!entry) return { status: 404, body: { error: "Waitlist entry not found." } };
  return { status: 200, body: { entry: publicEntry(entry) } };
}

export async function waitlistStats(): Promise<WaitlistStats> {
  const entries = await collection();
  const [totalJoined, totalInvited] = await Promise.all([
    entries.countDocuments(),
    entries.countDocuments({ status: "invited" })
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

export async function adminListWaitlist() {
  const entries = await collection();
  const rows = await entries.find().sort({ position: 1 }).limit(500).toArray();
  return rows.map(serialize);
}

export async function adminUpdateWaitlist(id: string, patch: { status?: WaitlistStatus }) {
  const entries = await collection();
  const update: Partial<WaitlistDocument> = { updatedAt: new Date() };
  if (patch.status) update.status = patch.status;

  await entries.updateOne({ _id: new ObjectId(id) } as Document, { $set: update });
  const updated = await entries.findOne({ _id: new ObjectId(id) } as Document);
  if (!updated) return undefined;
  return serialize(updated);
}

function serialize(entry: WithId<WaitlistDocument> | (WaitlistDocument & { _id: ObjectId })): WaitlistEntry {
  return {
    id: entry._id.toString(),
    walletAddress: entry.walletAddress,
    email: entry.email,
    xHandle: entry.xHandle,
    discord: entry.discord,
    referralCode: entry.referralCode,
    referredBy: entry.referredBy,
    status: entry.status,
    position: entry.position,
    source: entry.source,
    selectedTheme: entry.selectedTheme,
    selectedInterest: entry.selectedInterest,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function publicEntry(entry: WithId<WaitlistDocument>) {
  const serialized = serialize(entry);
  return {
    id: serialized.id,
    walletAddress: serialized.walletAddress,
    xHandle: serialized.xHandle,
    referralCode: serialized.referralCode,
    status: serialized.status,
    position: serialized.position,
    selectedInterest: serialized.selectedInterest,
    createdAt: serialized.createdAt,
    updatedAt: serialized.updatedAt
  };
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function referralCode(seed?: string) {
  const prefix = (seed || "RE").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "RE";
  const entropy = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${entropy}`;
}
