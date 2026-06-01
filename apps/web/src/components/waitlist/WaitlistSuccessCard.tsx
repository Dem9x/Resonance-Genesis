"use client";

import { Copy } from "lucide-react";
import type { WaitlistEntry } from "@/types/waitlist";

export function WaitlistSuccessCard({ entry }: { entry: WaitlistEntry }) {
  const referralUrl = typeof window === "undefined" ? "" : `${window.location.origin}/waitlist?ref=${entry.referralCode}`;

  async function copy() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(`Join Resonance Genesis with my resonance code ${entry.referralCode}: ${referralUrl}`);
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--success)]">Queue lock confirmed</p>
      <h2 className="mt-3 text-3xl font-black uppercase text-[var(--text)]">You are now locked into the resonance queue.</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Position" value={`#${entry.position}`} />
        <Metric label="Referral Code" value={entry.referralCode} />
      </div>
      <button type="button" onClick={copy} className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black theme-button">
        <Copy className="h-4 w-4" /> Copy referral link
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-black text-[var(--text)]">{value}</p>
    </div>
  );
}
