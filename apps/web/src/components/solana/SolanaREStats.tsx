"use client";

import type { ReactNode } from "react";
import { useREBalance } from "@/solana/useREBalance";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";

export function SolanaREStats() {
  const stats = useREBalance();
  const percent = stats.maxSupply ? (stats.totalSupply / stats.maxSupply) * 100 : 0;

  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">SPL RE Token</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Wallet RE" value={<AnimatedNumber value={stats.balance} decimals={4} suffix=" RE" />} />
        <Metric label="Total Minted" value={<AnimatedNumber value={stats.totalSupply} decimals={2} suffix=" RE" />} />
        <Metric label="Max Supply" value="1,000,000,000 RE" />
        <Metric label="Remaining" value={<AnimatedNumber value={stats.remainingSupply} decimals={2} suffix=" RE" />} />
      </div>
      <div className="mt-5">
        <AnimatedProgressBar value={percent} max={100} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-black text-[var(--text)]">{value}</p>
    </div>
  );
}
