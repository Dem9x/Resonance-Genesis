import Link from "next/link";
import { ArrowRight, Gauge, Pickaxe } from "lucide-react";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { StatsBar } from "@/components/StatsBar";
import type { ChladniMetadata } from "@/types/node";

const previewMetadata: ChladniMetadata = {
  name: "Preview Mode Chladni Node",
  description: "Local visual preview.",
  image: "",
  attributes: [
    { trait_type: "Frequency", value: "963 Hz" },
    { trait_type: "Mode", value: "6x8" },
    { trait_type: "Rarity Tier", value: "Preview Mode" }
  ]
};

export function TerminalHero() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <div>
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          <Gauge className="h-4 w-4" />
          Sepolia Miner Terminal
        </div>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.96] tracking-wide text-[var(--text)] md:text-7xl">
          Stake the Pattern. Mine the Resonance.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Resonance Genesis turns Chladni sand fields into on-chain miner artifacts. Each Chladni Node carries frequency traits that determine its mining power through deterministic cymatics math.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/mint" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition hover:scale-[1.02] theme-button">
            Mint Chladni Node <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/stake" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition hover:scale-[1.02] theme-button-secondary">
            <Pickaxe className="h-4 w-4" /> Open Miner Console
          </Link>
        </div>
        <div className="mt-10">
          <StatsBar />
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-6 rounded-[2rem] border border-[var(--panel-border)] bg-[var(--accent)]/5 blur-2xl" />
        <article className="glass-panel scanlines relative overflow-hidden rounded-3xl p-3">
          <div className="mb-3 flex items-center justify-between px-2 py-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">Preview Mode</p>
            <p className="text-xs text-[var(--muted)]">REAL DATA LOADS AFTER DEPLOYMENT</p>
          </div>
          <ContractNodeArtwork metadata={previewMetadata} tokenId={BigInt(1)} large />
          <div className="p-4 text-sm text-[var(--muted)]">
            IPFS images from Filebase appear here when tokenURI metadata is available.
          </div>
        </article>
      </div>
    </section>
  );
}
