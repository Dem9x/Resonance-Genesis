import { SectionShell } from "@/components/SectionShell";
import { SolanaStakePanel } from "@/components/solana/SolanaStakePanel";

export default function SolanaStakePage() {
  return (
    <SectionShell eyebrow="Solana Devnet Mode" title="Solana miner console" copy="Stake Chladni Nodes, monitor claimable RE, and claim real SPL RE when the 33 RE threshold is reached.">
      <SolanaStakePanel />
    </SectionShell>
  );
}
