import { SectionShell } from "@/components/SectionShell";
import { SolanaNodeDetailPanel } from "@/components/solana/SolanaNodeDetailPanel";

export default async function SolanaNodeDetailPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;

  return (
    <SectionShell eyebrow="Solana Devnet Mode" title="Solana node detail" copy="Node metadata, NodeTraits PDA, stake state, hashrate, and claimable RE are read from Solana wallet and program accounts.">
      <SolanaNodeDetailPanel mint={mint} />
    </SectionShell>
  );
}
