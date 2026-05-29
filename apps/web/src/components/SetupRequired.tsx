import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function SetupRequired({ title = "Sepolia contract setup required" }: { title?: string }) {
  return (
    <div className="glass-panel rounded-3xl p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-[var(--text)]">{title}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
            Add `NEXT_PUBLIC_RESONANCE_GENESIS_ADDRESS`, `NEXT_PUBLIC_CHLADNI_NODE_MINER_ADDRESS`, `NEXT_PUBLIC_RPC_URL`, and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to `.env.local`.
            Until then, the primary mint, gallery, staking, and node detail flows stay contract-first and will not pretend mock NFTs are live assets.
          </p>
          <Link href="/docs" className="mt-5 inline-flex rounded-full theme-button px-5 py-3 text-sm font-bold">
            Read setup docs
          </Link>
        </div>
      </div>
    </div>
  );
}
