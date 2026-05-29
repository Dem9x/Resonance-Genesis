import Link from "next/link";
import { Activity, Zap } from "lucide-react";
import type { ChladniNode } from "@/types/node";
import { NodeLabel } from "@/components/NodeLabel";

export function NodeArtwork({ node, large = false }: { node: ChladniNode; large?: boolean }) {
  const gradientMap: Record<string, string> = {
    "Cyan/Violet": "from-cyan-500 via-indigo-500 to-violet-600",
    "Ember/Magenta": "from-orange-400 via-pink-500 to-fuchsia-700",
    "Mint/Azure": "from-emerald-300 via-cyan-400 to-blue-700",
    "Solar/Iris": "from-yellow-300 via-rose-500 to-indigo-700",
    "Aurora/Indigo": "from-green-300 via-teal-500 to-indigo-800",
    "Rose/Plasma": "from-rose-300 via-purple-500 to-cyan-600"
  };

  return (
    <div className={`relative overflow-hidden rounded-t-2xl bg-gradient-to-br ${gradientMap[node.backgroundGradient] || gradientMap["Cyan/Violet"]} ${large ? "aspect-square" : "aspect-[1.08]"}`}>
      <div className="absolute inset-0 opacity-45 sand-field" />
      <div className="node-art absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[0.2px]" />
      <div className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 animate-slow-spin" />
      <div className="absolute inset-7 rounded-full border border-white/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(3,5,11,0.54)_74%)]" />
      <p className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1 font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white">
        #{node.tokenId.toString().padStart(3, "0")}
      </p>
    </div>
  );
}

export function ChladniNodeCard({ node }: { node: ChladniNode }) {
  return (
    <Link href={`/node/${node.tokenId}`} className="group block">
      <article className="glass-panel overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-archive-cyan/50 hover:shadow-neon">
        <NodeArtwork node={node} />
        <NodeLabel node={node} />
        <div className="grid grid-cols-2 gap-3 p-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-archive-cyan" />
            M{node.modeM}:N{node.modeN}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Zap className="h-4 w-4 text-archive-ember" />
            {node.resonanceEnergy} RE
          </div>
        </div>
      </article>
    </Link>
  );
}
