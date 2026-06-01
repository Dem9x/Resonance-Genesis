export const rpcQueryOptions = {
  staleTime: 45_000,
  gcTime: 5 * 60_000,
  refetchInterval: false as const,
  refetchOnWindowFocus: false
};

export const energyQueryOptions = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchInterval: 30_000,
  refetchOnWindowFocus: false
};

export function isRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("429") || message.toLowerCase().includes("too many requests") || message.toLowerCase().includes("rate limit");
}
