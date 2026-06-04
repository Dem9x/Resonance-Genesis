"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { SolanaClaimThreshold } from "@/components/solana/SolanaClaimThreshold";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaMinerConsole } from "@/components/solana/SolanaMinerConsole";
import { SolanaREProgress } from "@/components/solana/SolanaREProgress";
import { SolanaREStats } from "@/components/solana/SolanaREStats";
import { SolanaNodeCard } from "@/components/solana/SolanaNodeCard";
import { useChladniNodes } from "@/solana/useChladniNodes";
import { minClaimRe } from "@/solana/constants";
import { useStakeNode } from "@/solana/useStakeNode";
import { useClaimRE } from "@/solana/useClaimRE";
import { useState } from "react";

export function SolanaStakePanel() {
  const { connected } = useWallet();
  const { nodes, loading, error, refresh } = useChladniNodes();
  const { stakeNode, unstakeNode, loading: stakeLoading } = useStakeNode();
  const { claimRE, loading: claimLoading } = useClaimRE();
  const [txStatus, setTxStatus] = useState("");
  const claimable = nodes.reduce((sum, node) => sum + (node.claimableRe || 0), 0);

  async function run(label: string, action: () => Promise<string | undefined>) {
    setTxStatus(`${label} pending...`);
    try {
      const signature = await action();
      setTxStatus(signature ? `${label} confirmed: ${signature}` : `${label} confirmed`);
      await refresh();
    } catch (caught) {
      setTxStatus(caught instanceof Error ? caught.message : `${label} failed`);
    }
  }

  if (!connected) {
    return (
      <div className="glass-panel rounded-[2rem] p-10 text-center">
        <h2 className="font-display text-3xl font-black uppercase text-[var(--text)]">Connect Solana Wallet</h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">Connect Phantom or Solflare on Devnet to inspect Chladni Nodes, stake miners, and claim real SPL RE.</p>
        <div className="mt-6 flex justify-center">
          <SolanaConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <div className="space-y-5">
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Solana Miner Console</p>
          <h2 className="mt-3 text-3xl font-black uppercase text-[var(--text)]">Chladni Node Staking</h2>
          <p className="mt-3 text-[var(--muted)]">Real Solana transactions stake NFTs into a program vault and mint SPL RE when the 33 RE claim threshold is reached.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SolanaREProgress value={claimable} max={minClaimRe} />
            <SolanaClaimThreshold claimable={claimable} />
          </div>
        </div>
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Wallet Nodes</p>
              <h3 className="mt-2 text-2xl font-black text-[var(--text)]">Owned + Staked Miners</h3>
            </div>
            <button className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm font-bold text-[var(--text)]" onClick={refresh}>
              Refresh
            </button>
          </div>
          {txStatus ? <p className="mt-4 break-all rounded-xl border border-[var(--panel-border)] bg-[var(--bg)]/60 p-3 text-xs text-[var(--muted)]">{txStatus}</p> : null}
          {error ? <p className="mt-4 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">{error}</p> : null}
          {loading ? <p className="mt-6 text-[var(--muted)]">Scanning Solana Devnet wallet and program accounts...</p> : null}
          {!loading && !nodes.length ? (
            <p className="mt-6 text-center text-[var(--muted)]">No Solana Chladni Nodes detected yet. Mint on `/solana/mint`, set traits, then refresh this console.</p>
          ) : null}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {nodes.map((node) => (
              <div key={node.mint} className="space-y-3">
                <SolanaNodeCard node={node} />
                {!node.traits?.initialized ? (
                  <p className="rounded-xl border border-[var(--warning)]/35 bg-[var(--warning)]/10 p-3 text-xs leading-5 text-[var(--warning)]">
                    On-chain traits belum diset untuk mint ini. Jalankan `npm run set-traits` dengan NFT_MINT dan TRAIT_TOKEN_ID sebelum staking.
                  </p>
                ) : null}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className="rounded-full px-3 py-2 text-sm font-black theme-button disabled:opacity-50"
                    disabled={stakeLoading || Boolean(node.stake?.active) || !node.traits?.initialized}
                    title={!node.traits?.initialized ? "Set on-chain traits first before staking." : "Stake this Chladni Node"}
                    onClick={() => run("Stake", () => stakeNode(node.mint))}
                  >
                    {node.traits?.initialized ? "Stake" : "Set Traits"}
                  </button>
                  <button
                    className="rounded-full border border-[var(--panel-border)] px-3 py-2 text-sm font-black text-[var(--text)] disabled:opacity-50"
                    disabled={stakeLoading || !node.stake?.active}
                    onClick={() => run("Unstake", () => unstakeNode(node.mint))}
                  >
                    Unstake
                  </button>
                  <button
                    className="rounded-full border border-[var(--accent)]/50 px-3 py-2 text-sm font-black text-[var(--accent)] disabled:opacity-50"
                    disabled={claimLoading || !node.stake?.active || (node.claimableRe || 0) < minClaimRe}
                    onClick={() => run("Claim RE", () => claimRE(node.mint))}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="space-y-5">
        <SolanaREStats />
        <SolanaMinerConsole />
      </aside>
    </div>
  );
}
