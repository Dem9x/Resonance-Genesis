export async function fetchSolanaMetadata(uri?: string) {
  if (!uri) return undefined;
  const response = await fetch(uri.replace("ipfs://", process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.filebase.io/ipfs/"), { cache: "force-cache" });
  if (!response.ok) return undefined;
  return response.json() as Promise<{ name?: string; image?: string; attributes?: Array<{ trait_type: string; value: string | number }> }>;
}
