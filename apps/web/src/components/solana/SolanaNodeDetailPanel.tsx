"use client";

import { ExternalLink } from "lucide-react";
import { SolanaNodeCard } from "@/components/solana/SolanaNodeCard";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { solanaExplorerCluster } from "@/solana/constants";
import { useChladniNodes } from "@/solana/useChladniNodes";

export function SolanaNodeDetailPanel({ mint }: { mint: string }) {
  const { owner, nodes, loading, error, refresh } = useChladniNodes();
  const node = nodes.find((item) => item.mint === mint);
  const explorer = `https://explorer.solana.com/address/${mint}?cluster=${solanaExplorerCluster}`;

  if (!owner) {
    return (
      <div className="glass-panel rounded-[2rem] p-10 text-center">
        <p className="mb-5 text-[var(--muted)]">Connect the Solana wallet that owns or staked this Chladni Node.</p>
        <SolanaConnectButton />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div>{node ? <SolanaNodeCard node={node} /> : <div className="glass-panel rounded-[2rem] p-8 text-[var(--muted)]">{loading ? "Scanning wallet and stake accounts..." : "This mint was not found in the connected wallet or active stake accounts."}</div>}</div>
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">NFT Mint</p>
            <p className="mt-3 break-all font-mono text-sm text-[var(--text)]">{mint}</p>
          </div>
          <button onClick={refresh} className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm font-bold text-[var(--text)]">
            Refresh
          </button>
        </div>
        {error ? <p className="mt-4 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">{error}</p> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Metric label="Status" value={node?.stake?.active ? "Staked / Mining" : node ? "Owned / Idle" : "Unknown"} />
          <Metric label="Trait Source" value={node?.traitsSource || "None"} />
          <Metric label="Frequency" value={node?.traits?.frequency ? `${node.traits.frequency} Hz` : "Unset"} />
          <Metric label="Mode" value={node?.traits ? `${node.traits.modeN}x${node.traits.modeM}` : "Unset"} />
          <Metric label="Hashrate" value={node?.hashrate ? `${node.hashrate} H/s` : "0 H/s"} />
          <Metric label="Claimable RE" value={`${(node?.claimableRe || 0).toFixed(4)} RE`} />
        </div>
        <a href={explorer} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 font-black theme-button">
          Open in Solana Explorer <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}
