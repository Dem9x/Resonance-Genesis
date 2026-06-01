export function SolanaClaimThreshold({ claimable }: { claimable: number }) {
  const unlocked = claimable >= 33;
  return (
    <div className={`rounded-2xl border p-4 ${unlocked ? "border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]" : "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
      <p className="font-display text-xs font-black uppercase tracking-[0.18em]">
        {unlocked ? "Claim window unlocked" : "Minimum claim: 33 RE"}
      </p>
      <p className="mt-2 text-sm">Claims are enabled only when mined RE reaches the 33 RE threshold.</p>
    </div>
  );
}
