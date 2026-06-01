import { SectionShell } from "@/components/SectionShell";
import { XPostEmbed } from "@/components/XPostEmbed";

const resonancePostUrl = "https://x.com/Resogen_Chladni/status/2061411241114120527?s=20";

const posts = [
  ["RE Native Power", "RE is native resonance power for future miner utility, upgrades, allowlist boosts, cosmetics, and node evolution."],
  ["Sepolia Miner Layer", "The current dApp remains Sepolia-first with real contract-connected minting, staking, claiming, and Chladni trait reads."],
  ["Waitlist Opens", "Early users can now enter the resonance queue before broader Chladni Node activation windows."]
];

export default function NewsPage() {
  return (
    <SectionShell eyebrow="News" title="Resonance dispatches" copy="Project notes from the Resonance Genesis archive.">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <XPostEmbed url={resonancePostUrl} />
        <article className="glass-panel rounded-[1.5rem] p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Official Feed</p>
          <h2 className="mt-4 text-2xl font-black uppercase text-[var(--text)]">Resonance Genesis on X</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Latest public update from the Resonance Genesis account. If the embed is blocked by browser privacy settings, use the Open on X button to view the post directly.
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {posts.map(([title, copy]) => (
          <article key={title} className="glass-panel rounded-[1.5rem] p-6">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Archive Note</p>
            <h2 className="mt-4 text-xl font-black uppercase text-[var(--text)]">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
