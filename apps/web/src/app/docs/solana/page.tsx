import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, Archive, Coins, Database, FileCode2, KeyRound, Pickaxe, RadioTower, ShieldCheck, Wallet } from "lucide-react";
import { SectionShell } from "@/components/SectionShell";

const architecture = [
  ["GlobalConfig PDA", "Stores authority, RE mint, collection mint, treasury, total claimed RE, max RE supply, minimum claim amount, energy scale, and bump."],
  ["NodeTraits PDA", "One account per Chladni Node NFT mint. Stores frequency, mode N/M, node density, line thickness, rarity tier, pattern family hash, initialized flag, and bump."],
  ["StakeAccount PDA", "One account per staked NFT mint. Stores owner, NFT mint, staked timestamp, last claim timestamp, claimed RE, active flag, and bump."],
  ["Vault Token Account", "Program-controlled token account that holds the staked Chladni Node NFT while mining mode is active."],
  ["RE Mint", "SPL token mint for Resonance Energy. Devnet design uses 9 decimals, 1,000,000,000 RE max supply, and a program PDA mint authority."]
];

const instructions = [
  ["initialize", "Creates GlobalConfig and records the RE mint, collection mint, authority, 1B RE max supply, 33 RE minimum claim amount, and energy scale."],
  ["set_node_traits", "Authority-only instruction that creates or updates a NodeTraits PDA for an NFT mint. Traits power deterministic hashrate."],
  ["stake_node", "Transfers the user's Chladni Node NFT into the program vault and creates the StakeAccount PDA with mining mode active."],
  ["claim_re", "Calculates pending RE from hashrate and elapsed time. If pending RE is at least 33 RE, mints real SPL RE to the user's token account."],
  ["unstake_node", "Returns the NFT from the program vault to the stake owner and marks the StakeAccount inactive."],
  ["update_config", "Authority-only config update for min claim amount, energy scale, and authority rotation under safe constraints."]
];

const scripts = [
  ["npm run solana:build", "Build the Anchor program."],
  ["npm run solana:test", "Run Anchor tests once Anchor CLI and Rust are installed."],
  ["npm run solana:deploy:devnet", "Deploy the program to Solana Devnet."],
  ["npm run solana:create-re-token", "Create the RE SPL mint with 9 decimals and program PDA mint authority."],
  ["npm run solana:initialize", "Derive PDAs and prepare initialization inputs."],
  ["npm run solana:mint-samples", "Mint sample Chladni Node NFTs from Filebase/IPFS metadata."],
  ["npm run solana:set-traits", "Set on-chain NodeTraits PDAs from generated trait data."]
];

const frontendRoutes = [
  ["/solana", "Solana Devnet landing and configuration surface."],
  ["/solana/stake", "Solana miner console, wallet connection, RE stats, claim threshold, and stake flow."],
  ["/solana/gallery", "Owned and staked Solana Chladni Node gallery."],
  ["/solana/node/[mint]", "Node detail page with mint, explorer link, and future PDA metadata reads."],
  ["/docs/solana", "This Solana architecture manual."]
];

const envVars = [
  "NEXT_PUBLIC_SOLANA_NETWORK=devnet",
  "NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com",
  "NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID=",
  "NEXT_PUBLIC_RE_MINT_ADDRESS=",
  "NEXT_PUBLIC_CHLADNI_COLLECTION_MINT=",
  "NEXT_PUBLIC_SOLANA_EXPLORER_CLUSTER=devnet",
  "SOLANA_NETWORK=devnet",
  "SOLANA_RPC_URL=https://api.devnet.solana.com",
  "RESONANCE_SOLANA_PROGRAM_ID=",
  "RE_MINT_ADDRESS=",
  "CHLADNI_COLLECTION_MINT="
];

export default function SolanaDocsPage() {
  return (
    <SectionShell
      eyebrow="Solana Docs"
      title="Solana Devnet architecture"
      copy="Detailed technical manual for the Anchor program, SPL RE token, NFT vault escrow, PDA model, 33 RE claim threshold, frontend routes, and Devnet setup."
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/solana" className="rounded-full px-5 py-3 font-black theme-button">
          Open Solana Devnet Mode
        </Link>
        <Link href="/solana/stake" className="rounded-full px-5 py-3 font-black theme-button-secondary">
          Open Solana Miner Console
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <div className="glass-panel rounded-[1.5rem] p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Solana Index</p>
            <div className="mt-4 flex flex-col gap-2">
              {["Overview", "Accounts", "Instructions", "Formula", "Devnet Setup", "Frontend", "Safety"].map((item) => (
                <a key={item} href={`#${slug(item)}`} className="rounded-full border border-[var(--panel-border)] bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--text)]">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <Callout icon={<ShieldCheck className="h-5 w-5" />} title="Safety Language">
            RE is native energy and utility power. It is not APY, passive income, profit, or a guaranteed financial return.
          </Callout>
        </aside>

        <div className="space-y-6">
          <section id="overview" className="glass-panel rounded-[2rem] p-6 md:p-8">
            <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Overview</p>
            <h2 className="mt-3 text-3xl font-black uppercase text-[var(--text)]">Parallel Solana Devnet Mode</h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              The Solana version lives beside the existing EVM implementation. It does not remove Foundry, Solidity contracts, wagmi, RainbowKit, Sepolia pages, MongoDB waitlist, news, docs, or the current theme system.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MiniStat label="Network" value="Solana Devnet" icon={<RadioTower className="h-5 w-5" />} />
              <MiniStat label="RE Token" value="SPL / 9 decimals" icon={<Coins className="h-5 w-5" />} />
              <MiniStat label="Claim Gate" value="33 RE minimum" icon={<Pickaxe className="h-5 w-5" />} />
            </div>
          </section>

          <section id="accounts">
            <HeaderBlock icon={<Archive className="h-5 w-5" />} title="Program Accounts" copy="Core PDAs and token accounts used by the Anchor program." />
            <CardGrid items={architecture} />
          </section>

          <section id="instructions">
            <HeaderBlock icon={<FileCode2 className="h-5 w-5" />} title="Instructions" copy="Instruction surfaces planned for staking, trait management, and RE claims." />
            <CardGrid items={instructions} />
          </section>

          <section id="formula" className="glass-panel rounded-[2rem] p-6">
            <HeaderBlock icon={<Activity className="h-5 w-5" />} title="Hashrate And RE Formula" copy="All calculations use integer math. No floating point or randomness is required for mining power." compact />
            <div className="mt-5 space-y-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/60 p-4 font-mono text-sm text-[var(--text)]">
              <p>frequency_weight = integer_sqrt(frequency) * 100</p>
              <p>mode_complexity = mode_n * mode_m + abs(mode_n - mode_m) * 3</p>
              <p>base_hashrate = frequency_weight + mode_complexity * 40 + node_density_bps * 3 + line_thickness_bps * 2 + symmetry_bonus</p>
              <p>hashrate = base_hashrate * rarity_multiplier / 100</p>
              <p>pending_re_base_units = hashrate * elapsed_seconds * 1_000_000_000 / energy_scale</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Rarity multipliers: Common 100, Uncommon 115, Rare 135, Epic 165, Legendary 210, Mythic 280. Claiming is blocked until pending RE reaches 33 RE.
            </p>
          </section>

          <section id="devnet-setup">
            <HeaderBlock icon={<KeyRound className="h-5 w-5" />} title="Devnet Setup" copy="Install Solana CLI and Anchor, configure Devnet, fund a wallet, then build and deploy." />
            <div className="grid gap-5 lg:grid-cols-2">
              <CodeBlock lines={["solana config set --url devnet", "solana airdrop 2", "cd packages/solana", "anchor build", "anchor test", "anchor deploy"]} />
              <CodeBlock lines={scripts.map(([command, description]) => `${command} # ${description}`)} />
            </div>
          </section>

          <section id="frontend">
            <HeaderBlock icon={<Wallet className="h-5 w-5" />} title="Frontend And API" copy="Solana pages and cache endpoints are additive. EVM routes remain intact." />
            <div className="grid gap-5 lg:grid-cols-2">
              <CardGrid items={frontendRoutes} />
              <CodeBlock lines={envVars} />
            </div>
          </section>

          <section id="safety" className="grid gap-5 md:grid-cols-2">
            <Callout icon={<Database className="h-5 w-5" />} title="MongoDB Cache">
              Optional collections cache metadata and events: solanaNftMetadataCache, solanaStakeEvents, solanaReEvents, and solanaNodeTraitsCache. Program accounts and SPL token accounts remain source of truth.
            </Callout>
            <Callout icon={<ShieldCheck className="h-5 w-5" />} title="Mainnet Checklist">
              Before Mainnet Beta: audit the program, verify collection metadata, move authorities to governance or multisig, configure reliable RPC, and run event indexer backfills.
            </Callout>
          </section>
        </div>
      </div>
    </SectionShell>
  );
}

function HeaderBlock({ icon, title, copy, compact = false }: { icon: ReactNode; title: string; copy: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-4"}>
      <div className="flex items-center gap-3 text-[var(--accent)]">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--panel-border)] bg-[var(--accent)]/10">{icon}</span>
        <h2 className="font-display text-2xl font-black uppercase text-[var(--text)]">{title}</h2>
      </div>
      <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
    </div>
  );
}

function CardGrid({ items }: { items: string[][] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map(([title, copy]) => (
        <article key={title} className="glass-panel rounded-[1.5rem] p-5">
          <h3 className="font-display text-lg font-black uppercase text-[var(--text)]">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy}</p>
        </article>
      ))}
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <div className="text-[var(--accent)]">{icon}</div>
      <p className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-black text-[var(--text)]">{value}</p>
    </div>
  );
}

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <pre className="glass-panel overflow-x-auto rounded-[1.5rem] p-5 text-sm leading-7 text-[var(--text)]">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

function Callout({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <div className="flex items-center gap-3 text-[var(--accent)]">
        {icon}
        <p className="font-display text-sm font-black uppercase tracking-[0.18em] text-[var(--text)]">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{children}</p>
    </div>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
