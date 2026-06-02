"use client";

import { SectionShell } from "@/components/SectionShell";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaNodeCard } from "@/components/solana/SolanaNodeCard";
import { useChladniNodes } from "@/solana/useChladniNodes";

export default function SolanaGalleryPage() {
  const { nodes, owner, loading, error, refresh } = useChladniNodes();

  return (
    <SectionShell eyebrow="Solana Devnet Mode" title="Solana Chladni gallery" copy="Owned and staked Chladni Nodes from Solana Devnet appear here when the program and collection are configured.">
      {!owner ? (
        <div className="glass-panel rounded-[2rem] p-10 text-center">
          <p className="mb-5 text-[var(--muted)]">Connect a Solana wallet to scan Devnet Chladni Nodes.</p>
          <SolanaConnectButton />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-5">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Wallet scan</p>
              <p className="mt-2 text-[var(--muted)]">{loading ? "Scanning owned token accounts and staked miner PDAs..." : `${nodes.length} node records detected.`}</p>
            </div>
            <button className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm font-bold text-[var(--text)]" onClick={refresh}>
              Refresh
            </button>
          </div>
          {error ? <div className="rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-[var(--danger)]">{error}</div> : null}
          {nodes.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {nodes.map((node) => <SolanaNodeCard key={node.mint} node={node} />)}
            </div>
          ) : (
            <div className="glass-panel rounded-[2rem] p-10 text-center text-[var(--muted)]">No Solana Chladni Nodes detected yet.</div>
          )}
        </div>
      )}
    </SectionShell>
  );
}
