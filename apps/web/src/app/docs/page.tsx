import Link from "next/link";
import { Activity, Archive, Atom, Database, FileCode2, Pickaxe, RadioTower, ShieldCheck, Zap } from "lucide-react";
import { FormulaPanel } from "@/components/FormulaPanel";
import { ResonanceWaveChart } from "@/components/ResonanceWaveChart";

const sections = [
  {
    title: "What is Resonance Genesis?",
    copy: "Resonance Genesis is a Sepolia-first generative cymatics NFT system. The ERC721 contract mints Chladni Nodes and stores compact on-chain traits used by the miner contract.",
    icon: Archive,
    tag: "Protocol"
  },
  {
    title: "What is a Chladni Node?",
    copy: "A Chladni Node is a frequency-born NFT artifact. Its metadata lives on Filebase/IPFS, while the contract stores frequency, mode N/M, node density, line thickness, and rarity tier for deterministic mining math.",
    icon: Atom,
    tag: "Artifact"
  },
  {
    title: "Why frequency matters",
    copy: "Higher frequency produces denser standing-wave structures, so the on-chain approximation weights sqrt(frequency) to represent cymatic complexity with integer-safe math.",
    icon: Activity,
    tag: "Signal"
  },
  {
    title: "What is Chladni mode N/M?",
    copy: "Mode N and Mode M describe standing-wave layers and nodal crossings. The miner uses modeN * modeM plus a delta term to approximate mode complexity.",
    icon: RadioTower,
    tag: "Mode"
  },
  {
    title: "What is the node detector?",
    copy: "Classic Chladni patterns can be described by f(x,y) = cos(n*x)cos(m*y) - cos(m*x)cos(n*y). The dApp displays this as explanation, while the contract uses integer-safe trait approximations.",
    icon: FileCode2,
    tag: "Math"
  },
  {
    title: "How hashrate is calculated",
    copy: "baseHashrate = sqrt(frequency)*100 + modeComplexity*40 + nodeDensityBps*3 + lineThicknessBps*2 + symmetryBonus. hashrate = baseHashrate * rarityMultiplier / 100.",
    icon: Pickaxe,
    tag: "Miner"
  },
  {
    title: "How staking works",
    copy: "The miner contract accepts approved ResonanceGenesis NFTs, transfers them into escrow, records staked owner and claim timestamp, and computes pending RE from hashrate and elapsed seconds.",
    icon: Pickaxe,
    tag: "Staking"
  },
  {
    title: "What is RE?",
    copy: "RE is native resonance power. It is a capped ERC20 token with 1B max supply, minted only by the ChladniNodeMiner contract when users claim mined RE. RE is utility power, not a financial return.",
    icon: Zap,
    tag: "Native Power"
  },
  {
    title: "How Filebase/IPFS metadata works",
    copy: "tokenURI resolves to ipfs://<METADATA_CID>/<tokenId>.json. Each metadata file points its image field to ipfs://<IMAGE_CID>/<tokenId>.png. The frontend converts both to the configured IPFS gateway.",
    icon: Database,
    tag: "Metadata"
  },
  {
    title: "Why Sepolia first",
    copy: "Sepolia lets minting, trait setting, staking, claiming, and IPFS metadata be tested with real transactions before mainnet addresses are configured.",
    icon: ShieldCheck,
    tag: "Testnet"
  },
  {
    title: "How to switch to mainnet later",
    copy: "Deploy the same contracts to mainnet, update chain ID, RPC URL, ResonanceGenesis address, ChladniNodeMiner address, and then verify contract ABIs.",
    icon: RadioTower,
    tag: "Launch"
  },
  {
    title: "Safety note",
    copy: "RE is an in-app utility power balance. This project does not promise APY, guaranteed rewards, or financial return.",
    icon: ShieldCheck,
    tag: "Safety"
  }
];

const quickLinks = ["Protocol", "Artifact", "Signal", "Miner", "Native Power", "Metadata", "Safety"];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_0_46px_var(--glow)] md:p-10">
        <div className="absolute inset-0 opacity-35 archive-grid" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[var(--accent)]/20" />
        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.34em] text-[var(--accent)]">Technical Docs</p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-black uppercase leading-none text-[var(--text)] md:text-7xl">
              Resonance Mining Manual
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              A field guide for Chladni Nodes, deterministic hashrate, RE native power, staking flow, Filebase/IPFS metadata, and Sepolia-first deployment.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/stake" className="rounded-full px-5 py-3 text-sm font-black theme-button">
                Open Miner Console
              </Link>
              <Link href="/waitlist" className="rounded-full px-5 py-3 text-sm font-black theme-button-secondary">
                Join Waitlist
              </Link>
            </div>
          </div>
          <ResonanceWaveChart frequency={963} />
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="glass-panel rounded-[1.5rem] p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Archive Index</p>
            <div className="mt-4 flex flex-wrap gap-2 lg:flex-col">
              {quickLinks.map((item) => (
                <a key={item} href={`#${slug(item)}`} className="rounded-full border border-[var(--panel-border)] bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--text)]">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">RE Safety</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              RE is native resonance power for ecosystem mechanics. It is not APY, yield, or a guaranteed financial return.
            </p>
          </div>
        </aside>

        <div className="space-y-5">
          <FormulaPanel />
          <div className="grid gap-5 md:grid-cols-2">
            {sections.map(({ title, copy, icon: Icon, tag }) => (
              <article id={slug(tag)} key={title} className="glass-panel group relative overflow-hidden rounded-[1.5rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/60">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70" />
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--panel-border)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_18px_var(--glow)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-[var(--panel-border)] bg-white/5 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {tag}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-xl font-black uppercase text-[var(--text)]">{title}</h2>
                <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
