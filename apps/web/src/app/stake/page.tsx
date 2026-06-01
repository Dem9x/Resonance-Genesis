import { SectionShell } from "@/components/SectionShell";
import { StakePanel } from "@/components/StakePanel";

export default function StakePage() {
  return (
    <SectionShell eyebrow="Stake" title="Chladni Node miner dashboard" copy="Stake owned nodes, monitor mining state, and claim RE native resonance power through a contract-connected console.">
      <StakePanel />
    </SectionShell>
  );
}
