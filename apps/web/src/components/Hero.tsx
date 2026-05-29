import Link from "next/link";
import { ArrowRight, Gauge, Pickaxe } from "lucide-react";
import { mockNodes } from "@/data/mockNodes";
import { NodeArtwork } from "@/components/ChladniNodeCard";
import { NodeLabel } from "@/components/NodeLabel";
import { StatsBar } from "@/components/StatsBar";

export function Hero() {
  const previewNode = mockNodes[5];

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <div>
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-archive-cyan/25 bg-archive-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-archive-cyan">
          <Gauge className="h-4 w-4" />
          Resonance Archive Online
        </div>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.96] tracking-wide text-white md:text-7xl">
          Stake the Pattern. Mine the Resonance.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Each Chladni Node is a frequency-born artifact from the Resonance Genesis collection. Activate your node as a miner and accumulate Resonance Energy.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/mint" className="inline-flex items-center justify-center gap-2 rounded-full bg-archive-cyan px-6 py-3 font-bold text-archive-black shadow-neon transition hover:scale-[1.02]">
            Mint Chladni Node <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/stake" className="inline-flex items-center justify-center gap-2 rounded-full border border-archive-violet/40 bg-archive-violet/10 px-6 py-3 font-bold text-white shadow-violet transition hover:bg-archive-violet/20">
            <Pickaxe className="h-4 w-4" /> Open Miner Dashboard
          </Link>
        </div>
        <div className="mt-10">
          <StatsBar />
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-6 rounded-[2rem] border border-archive-cyan/10 bg-archive-cyan/5 blur-2xl" />
        <article className="glass-panel scanlines relative overflow-hidden rounded-3xl p-3 shadow-neon">
          <div className="mb-3 flex items-center justify-between px-2 py-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-archive-cyan">Artifact Preview</p>
            <p className="text-xs text-slate-400">LIVE / MODE 7:5</p>
          </div>
          <NodeArtwork node={previewNode} large />
          <NodeLabel node={previewNode} />
        </article>
      </div>
    </section>
  );
}
