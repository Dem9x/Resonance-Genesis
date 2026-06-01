import { isRateLimitError } from "@/lib/query";

export function RpcRateLimitNotice({ error }: { error: unknown }) {
  if (!isRateLimitError(error)) return null;

  return (
    <div className="rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm font-semibold text-[var(--warning)]">
      RPC rate limited, retrying with cached data and fallback transports. Miner data refreshes on the next safe interval.
    </div>
  );
}
