import { solanaNetwork } from "@/solana/constants";

export function SolanaNetworkBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--success)] shadow-[0_0_18px_var(--glow)]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)]" />
      Solana {solanaNetwork}
    </span>
  );
}
