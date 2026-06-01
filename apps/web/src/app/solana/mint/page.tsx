import { SectionShell } from "@/components/SectionShell";
import { SolanaMintPanel } from "@/components/solana/SolanaMintPanel";

export default function SolanaMintPage() {
  return (
    <SectionShell
      eyebrow="Solana Devnet Mode"
      title="Solana Chladni Node mint"
      copy="Mint the Solana Devnet version of a Chladni Node NFT, then activate it as a miner for SPL RE utility power."
    >
      <SolanaMintPanel />
    </SectionShell>
  );
}
