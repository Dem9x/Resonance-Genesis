import { requiredChainId } from "@/lib/chains";

export function ContractStatus({ wrongNetwork }: { wrongNetwork?: boolean }) {
  if (!wrongNetwork) return null;

  return (
    <div className="mb-5 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm text-[var(--warning)]">
      Sepolia is required for this deployment. Switch your wallet to chain ID {requiredChainId}.
    </div>
  );
}
