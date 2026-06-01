"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { SolanaClaimThreshold } from "@/components/solana/SolanaClaimThreshold";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaMinerConsole } from "@/components/solana/SolanaMinerConsole";
import { SolanaREProgress } from "@/components/solana/SolanaREProgress";
import { SolanaREStats } from "@/components/solana/SolanaREStats";
import { useChladniNodes } from "@/solana/useChladniNodes";
import { minClaimRe } from "@/solana/constants";

export function SolanaStakePanel() {
  const { connected } = useWallet();
  const { nodes } = useChladniNodes();
  const claimable = 0;

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
          <p className="mt-3 text-[var(--muted)]">Real Solana transactions will stake NFTs into a program vault and mint SPL RE when the 33 RE claim threshold is reached.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SolanaREProgress value={claimable} max={minClaimRe} />
            <SolanaClaimThreshold claimable={claimable} />
          </div>
        </div>
        <div className="glass-panel rounded-[2rem] p-6 text-center text-[var(--muted)]">
          {nodes.length ? "Rendering wallet Chladni Nodes." : "No Solana Chladni Nodes detected yet. Mint sample Devnet nodes, then refresh this console."}
        </div>
      </div>
      <aside className="space-y-5">
        <SolanaREStats />
        <SolanaMinerConsole />
      </aside>
    </div>
  );
}
