import Link from "next/link";
import { SectionShell } from "@/components/SectionShell";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaNetworkBadge } from "@/components/solana/SolanaNetworkBadge";
import { SolanaREStats } from "@/components/solana/SolanaREStats";
import { chladniCollectionMint, reMintAddress, resonanceProgramId } from "@/solana/constants";

export default function SolanaPage() {
  return (
    <SectionShell
      eyebrow="Solana Devnet Mode"
      title="Resonance Genesis on Solana."
      copy="A parallel Devnet implementation for Chladni Node staking, NFT vault escrow, and real SPL RE utility token claims."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <SolanaNetworkBadge />
            <span className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">SPL RE Token</span>
          </div>
          <h1 className="mt-6 text-4xl font-black uppercase text-[var(--text)] md:text-5xl">Solana Devnet Mode</h1>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
            RE is a real SPL token on Solana Devnet. Claiming unlocks at 33 RE and mints mined RE to the user token account through the Resonance Genesis Anchor program.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-[var(--muted)]">
            <Address label="Program ID" value={resonanceProgramId} />
            <Address label="RE Mint" value={reMintAddress} />
            <Address label="Collection Mint" value={chladniCollectionMint} />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/solana/mint" className="rounded-full px-5 py-3 font-black theme-button">Mint Solana Node</Link>
            <Link href="/solana/stake" className="rounded-full px-5 py-3 font-black theme-button">Open Solana Miner Console</Link>
            <Link href="/solana/gallery" className="rounded-full px-5 py-3 font-black theme-button-secondary">View Solana Gallery</Link>
            <Link href="/waitlist" className="rounded-full border border-[var(--panel-border)] px-5 py-3 font-black text-[var(--text)]">Join Waitlist</Link>
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex justify-end">
            <SolanaConnectButton />
          </div>
          <SolanaREStats />
        </div>
      </div>
    </SectionShell>
  );
}

function Address({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 break-all font-mono text-[var(--text)]">{value || "Not configured"}</p>
    </div>
  );
}
