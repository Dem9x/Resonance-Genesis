import { MiningConsole } from "@/components/MiningConsole";

export function SolanaMinerConsole() {
  return (
    <MiningConsole
      logs={[
        "Solana Devnet Mode initialized",
        "SPL RE token channel online",
        "33 RE minimum claim threshold loaded",
        "program account scan interval set to 45s",
        "miner console ready"
      ]}
    />
  );
}
