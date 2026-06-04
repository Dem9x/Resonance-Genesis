"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2, ExternalLink, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaNetworkBadge } from "@/components/solana/SolanaNetworkBadge";
import {
  chladniCollectionMint,
  mintPriceSol,
  nftRoyaltyBps,
  resonanceProgramId,
  solanaCreatorTreasury,
  solanaExplorerCluster,
} from "@/solana/constants";
import { mintSolanaChladniNode, type SolanaMintResult } from "@/solana/mintClient";
import { PublicKey } from "@solana/web3.js";

export function SolanaMintPanel() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<"idle" | "waiting" | "pending" | "success" | "error">("idle");
  const [result, setResult] = useState<SolanaMintResult | undefined>();
  const [error, setError] = useState("");
  const configured = Boolean(resonanceProgramId && chladniCollectionMint);
  const royaltyPercent = Number.isFinite(nftRoyaltyBps) ? nftRoyaltyBps / 100 : 5;
  const collectionKey = useMemo(() => {
    try {
      return chladniCollectionMint ? new PublicKey(chladniCollectionMint) : undefined;
    } catch {
      return undefined;
    }
  }, []);

  async function handleMint() {
    if (!publicKey || !collectionKey) return;
    setStatus("waiting");
    setError("");
    setResult(undefined);
    try {
      setStatus("pending");
      const minted = await mintSolanaChladniNode({
        connection,
        payer: publicKey,
        collectionMint: collectionKey,
        sendTransaction,
      });
      setResult(minted);
      setStatus("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Mint transaction failed.");
      setStatus("error");
    }
  }

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
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Primary Mint Fee" value={`${mintPriceSol.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`} />
            <Metric label="Creator Royalty" value={`${royaltyPercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`} />
            <Metric label="Creator Treasury" value={shortAddress(solanaCreatorTreasury)} />
          </div>
        </div>

        {!connected ? (
          <div className="rounded-2xl border border-[var(--panel-border)] bg-white/5 p-4">
            <p className="mb-4 text-sm text-[var(--muted)]">Connect Phantom or Solflare on Devnet to mint a Solana Chladni Node.</p>
            <SolanaConnectButton />
          </div>
        ) : (
          <button
            type="button"
            disabled={!configured || status === "waiting" || status === "pending"}
            onClick={handleMint}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-black disabled:cursor-not-allowed disabled:opacity-60 theme-button"
          >
            {status === "waiting" || status === "pending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {status === "waiting" ? "Waiting for wallet" : status === "pending" ? "Confirming Devnet mint" : "Mint Chladni Node"}
          </button>
        )}

        <div className="mt-5 rounded-2xl border border-[var(--warning)]/35 bg-[var(--warning)]/10 p-4 text-sm leading-6 text-[var(--warning)]">
          {configured
            ? "Live Devnet mint is enabled. The primary mint fee is transferred to the creator treasury in the mint transaction. Marketplace royalty metadata is stored on the NFT, but enforcement depends on marketplace support."
            : "Configure NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID and NEXT_PUBLIC_CHLADNI_COLLECTION_MINT first. Existing EVM mint remains available at /mint."}
        </div>

        {status === "success" && result ? (
          <div className="mt-5 rounded-2xl border border-[var(--success)]/35 bg-[var(--success)]/10 p-4 text-sm leading-6 text-[var(--success)]">
            <div className="flex items-center gap-2 font-black">
              <CheckCircle2 className="h-4 w-4" /> Mint confirmed: Chladni Node #{result.tokenId}
            </div>
            <p className="mt-2 break-all font-mono text-xs text-[var(--text)]">NFT_MINT={result.mint}</p>
            <a
              href={`https://explorer.solana.com/tx/${result.signature}?cluster=${solanaExplorerCluster}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-bold text-[var(--accent)]"
            >
              View transaction <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-5 rounded-2xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 p-4 text-sm leading-6 text-[var(--danger)]">
            <div className="flex items-center gap-2 font-black">
              <TriangleAlert className="h-4 w-4" /> Mint failed
            </div>
            <p className="mt-2 break-words">{error}</p>
          </div>
        ) : null}
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

function shortAddress(value: string) {
  if (!value) return "Not configured";
  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}
