import { MintPanel } from "@/components/MintPanel";
import { SectionShell } from "@/components/SectionShell";

export default function MintPage() {
  return (
    <SectionShell eyebrow="Mint" title="Genesis mint chamber" copy="Connect a wallet, select quantity, and mint a frequency-born Chladni Node when the deployed contract is configured.">
      <MintPanel />
    </SectionShell>
  );
}
