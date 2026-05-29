import { SectionShell } from "@/components/SectionShell";
import { StakePanel } from "@/components/StakePanel";

export default function StakePage() {
  return (
    <SectionShell eyebrow="Stake" title="Chladni Node miner dashboard" copy="Stake owned nodes, monitor mining state, and claim Resonance Energy utility points through a console built for future contract integration.">
      <StakePanel />
    </SectionShell>
  );
}
