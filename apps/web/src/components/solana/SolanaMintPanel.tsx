"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Sparkles } from "lucide-react";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaNetworkBadge } from "@/components/solana/SolanaNetworkBadge";
import { chladniCollectionMint, resonanceProgramId } from "@/solana/constants";

export function SolanaMintPanel() {
  const { connected, publicKey } = useWallet();
  const configured = Boolean(resonanceProgramId && chladniCollectionMint);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="glass-panel relative min-h-[460px] overflow-hidden rounded-[2rem] p-4">
        <div className="absolute inset-0 opacity-40 sand-field" />
        <div className="node-art absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/80 p-4 backdrop-blur">
          <p className="font-display text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">Solana Chladni Node</p>
          <p className="mt-2 text-2xl font-black text-[var(--text)]">Devnet Mint Chamber</p>
        </div>
      </article>

      <div className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <SolanaNetworkBadge />
          <span className="rounded-full border border-[var(--panel-border)] bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">
            Metaplex NFT Mint
          </span>
        </div>
        <h1 className="mt-6 font-display text-4xl font-black uppercase text-[var(--text)]">Mint Chladni Node on Solana</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Solana minting is the Devnet path for creating Chladni Node NFTs from the existing Filebase/IPFS metadata pipeline. Minted nodes can later be staked into the Anchor miner program and claim SPL RE after the 33 RE threshold.
        </p>

        <div className="my-6 grid gap-3">
          <Metric label="Connected Wallet" value={publicKey?.toBase58() || "Not connected"} />
          <Metric label="Program ID" value={resonanceProgramId || "Not configured"} />
          <Metric label="Collection Mint" value={chladniCollectionMint || "Not configured"} />
        </div>

        {!connected ? (
          <div className="rounded-2xl border border-[var(--panel-border)] bg-white/5 p-4">
            <p className="mb-4 text-sm text-[var(--muted)]">Connect Phantom or Solflare on Devnet to mint a Solana Chladni Node.</p>
            <SolanaConnectButton />
          </div>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full px-6 py-4 font-black opacity-60 theme-button"
          >
            <Sparkles className="h-5 w-5" /> Mint opens after Devnet collection config
          </button>
        )}

        <div className="mt-5 rounded-2xl border border-[var(--warning)]/35 bg-[var(--warning)]/10 p-4 text-sm leading-6 text-[var(--warning)]">
          {configured
            ? "Collection config detected. Wire the mint-chladni-nodes script or Metaplex mint transaction client to enable live Devnet minting."
            : "Configure NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID and NEXT_PUBLIC_CHLADNI_COLLECTION_MINT first. Existing EVM mint remains available at /mint."}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 break-all font-mono text-sm font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}
