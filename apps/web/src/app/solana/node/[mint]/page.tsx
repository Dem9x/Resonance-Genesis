import { SectionShell } from "@/components/SectionShell";
import { solanaExplorerCluster } from "@/solana/constants";

export default async function SolanaNodeDetailPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  const explorer = `https://explorer.solana.com/address/${mint}?cluster=${solanaExplorerCluster}`;

  return (
    <SectionShell eyebrow="Solana Devnet Mode" title="Solana node detail" copy="Node metadata, NodeTraits PDA, stake state, hashrate, and claimable RE will render here from Solana program accounts.">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">NFT Mint</p>
        <p className="mt-3 break-all font-mono text-[var(--text)]">{mint}</p>
        <a href={explorer} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full px-5 py-3 font-black theme-button">
          Open in Solana Explorer
        </a>
      </div>
    </SectionShell>
  );
}
