import type { ChladniMetadata } from "@/types/node";

export async function fetchMetadataBatch(tokenIds: bigint[]) {
  if (!tokenIds.length) return {};
  const ids = tokenIds.map((tokenId) => tokenId.toString());
  const response = await fetch(`/api/metadata?ids=${ids.join(",")}`, { cache: "no-store" });
  if (!response.ok) return {};

  try {
    const data = (await response.json()) as { metadata?: Record<string, ChladniMetadata> };
    return data.metadata || {};
  } catch {
    return {};
  }
}
