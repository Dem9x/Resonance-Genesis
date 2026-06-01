"use client";

import { useEffect, useState } from "react";
import { getWaitlistStats } from "@/lib/waitlist";
import type { WaitlistStats } from "@/types/waitlist";
import { WaitlistProgress } from "@/components/waitlist/WaitlistProgress";

const fallbackStats: WaitlistStats = {
  totalJoined: 0,
  totalInvited: 0,
  remainingSlots: Number(process.env.NEXT_PUBLIC_WAITLIST_TARGET_SLOTS || 1000),
  currentPhase: "early-access",
  launchTimestamp: process.env.NEXT_PUBLIC_WAITLIST_TARGET_DATE || "2026-06-30T12:00:00Z",
  targetSlots: Number(process.env.NEXT_PUBLIC_WAITLIST_TARGET_SLOTS || 1000)
};

export function WaitlistStatsPanel() {
  const [stats, setStats] = useState<WaitlistStats>(fallbackStats);
  const [error, setError] = useState("");

  useEffect(() => {
    getWaitlistStats()
      .then((nextStats) => {
        setStats(nextStats);
        setError("");
      })
      .catch(() => setError("Live stats are temporarily unavailable. Showing configured resonance slot target."));
  }, []);

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm text-[var(--warning)]">Waitlist stats are warming up: {error}</div> : null}
      <WaitlistProgress totalJoined={stats.totalJoined} targetSlots={stats.targetSlots} />
    </div>
  );
}
