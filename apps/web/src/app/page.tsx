import { Atom, AudioWaveform, BadgeCheck, CircleDot, Gem, Layers3, Pickaxe, Zap } from "lucide-react";
import { Roadmap } from "@/components/Roadmap";
import { SectionShell } from "@/components/SectionShell";
import { SetupRequired } from "@/components/SetupRequired";
import { TerminalHero } from "@/components/TerminalHero";
import { TraitBadge } from "@/components/TraitBadge";

const traits = [
  ["Frequency", "174-1026 Hz", AudioWaveform],
  ["Mode", "M:N harmonic pairs", CircleDot],
  ["Background Gradient", "Archive spectra", Layers3],
  ["Pattern Family", "Cymatic lineages", Atom],
  ["Node Architecture", "Sand field topology", Gem],
  ["Resonance Energy", "Utility points", Zap],
  ["Mining State", "Idle / Mining / Cooldown", Pickaxe],
  ["Rarity Tier", "Common to Mythic", BadgeCheck]
];

export default function HomePage() {
  return (
    <>
      <TerminalHero />
      <SectionShell
        eyebrow="Collection Overview"
        title="From cymatic sand fields to on-chain miner identity."
        copy="Each Chladni Node is generated from frequency, mode, node architecture, background gradient, and sand resonance. Visual traits include Frequency, Mode, Pattern Family, Background Gradient, Node Architecture, and Rarity Tier."
      >
        <SetupRequired title="Deploy Sepolia contracts to activate live collection data" />
      </SectionShell>
      <SectionShell
        eyebrow="Utility"
        title="Activate mining mode."
        copy="Holders can stake Chladni Node NFTs to activate miner state. Staked nodes generate Resonance Energy points over time for future in-app uses such as upgrades, allowlist access, future mints, cosmetics, or protocol utilities."
      >
        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-4">
            {["Stake NFT", "Mine Utility Points", "Claim Energy", "Upgrade Future Nodes"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-archive-cyan">0{index + 1}</p>
                <p className="mt-5 text-xl font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-400">Resonance Energy is represented here as in-app utility points. This interface does not promise financial return, APY, or yield.</p>
        </div>
      </SectionShell>
      <SectionShell eyebrow="Trait System" title="Archive metadata matrix." copy="Some nodes have rarer gradients and higher resonance complexity, creating distinct artifact signatures across the collection.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {traits.map(([label, value, Icon]) => (
            <TraitBadge key={label as string} label={label as string} value={value as string} icon={<Icon className="h-5 w-5" />} />
          ))}
        </div>
      </SectionShell>
      <SectionShell eyebrow="Roadmap" title="Resonance deployment sequence.">
        <Roadmap />
      </SectionShell>
    </>
  );
}
