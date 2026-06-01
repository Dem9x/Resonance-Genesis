import type { Metadata } from "next";
import Link from "next/link";
import { CinematicCountdown } from "@/components/waitlist/CinematicCountdown";
import { REPowerExplainer } from "@/components/waitlist/REPowerExplainer";
import { SandSettleAnimation } from "@/components/waitlist/SandSettleAnimation";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { WaitlistStatsPanel } from "@/components/waitlist/WaitlistStatsPanel";

const targetDate = process.env.NEXT_PUBLIC_WAITLIST_TARGET_DATE || "2026-06-30T12:00:00Z";

export const metadata: Metadata = {
  title: "Resonance Genesis Waitlist | Chladni Node Miner Access",
  description: "Join the Resonance Genesis waitlist for early access to Chladni Node NFTs, RE native power, and cymatics-inspired miner utility.",
  openGraph: {
    title: "Resonance Genesis Waitlist",
    description: "Early access to Chladni Node NFTs, RE native power, and cymatics-inspired miner utility.",
    images: ["/og/resonance-genesis-og.png"]
  }
};

export default function WaitlistPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Resonance Genesis Waitlist",
    description: metadata.description,
    startDate: targetDate,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled"
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.34em] text-[var(--accent)]">RE Native Power Queue</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-black uppercase text-[var(--text)] md:text-7xl">Enter the Resonance Queue</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Join the early access list for Resonance Genesis, where Chladni Nodes become miner artifacts powered by RE native resonance energy.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#join" className="inline-flex justify-center rounded-full px-6 py-3 font-black theme-button">
              Join Waiting List
            </a>
            <Link href="/docs" className="inline-flex justify-center rounded-full px-6 py-3 font-black theme-button-secondary">
              Read the Chladni Node Docs
            </Link>
          </div>
          <div className="mt-8">
            <CinematicCountdown targetDate={targetDate} />
          </div>
        </div>
        <div className="glass-panel overflow-hidden rounded-[2rem] p-3">
          <SandSettleAnimation particleCount={420} intensity="medium" mode="node" />
        </div>
      </section>

      <section id="join" className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <WaitlistForm />
        <div className="space-y-6">
          <WaitlistStatsPanel />
          <REPowerExplainer />
        </div>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {[
          ["Why join early?", "Reserve an early resonance slot before broader activation, follow miner utility development, and receive protocol updates."],
          ["Native Power", "RE is native resonance power. Stake a Chladni Node to activate mining mode and accumulate RE over time."],
          ["Safety", "RE is a utility power balance, not a financial return."]
        ].map(([title, copy]) => (
          <article key={title} className="glass-panel rounded-[1.5rem] p-6">
            <h2 className="font-display text-xl font-black uppercase text-[var(--text)]">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 glass-panel rounded-[2rem] p-6">
        <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Mini Timeline</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["Queue Opens", "Sepolia Miner Testing", "Mainnet Resonance Window", "Node Evolution Utility"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-[var(--panel-border)] bg-white/5 p-4">
              <p className="font-display text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">0{index + 1}</p>
              <p className="mt-4 font-bold text-[var(--text)]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        {[
          ["Is RE a token?", "Yes. RE is a capped ERC20 token with 1B max supply. It is minted only by the staking/miner contract when users claim mined RE."],
          ["Do I need a wallet?", "Wallet is preferred, but the waitlist accepts wallet, email, or X handle so early users can reserve a slot."],
          ["Does RE promise returns?", "No. RE is not APY, yield, passive income, profit, or a guaranteed financial reward."],
          ["What powers node output?", "Hashrate uses deterministic Chladni-inspired traits: frequency, mode complexity, node density, line thickness, symmetry, and rarity."]
        ].map(([title, copy]) => (
          <article key={title} className="glass-panel rounded-[1.5rem] p-6">
            <h2 className="font-display text-lg font-black uppercase text-[var(--text)]">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
