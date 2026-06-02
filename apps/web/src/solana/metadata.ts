export function ipfsToHttp(uri?: string) {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.filebase.io/ipfs/";
    return `${gateway.replace(/\/$/, "")}/${uri.replace("ipfs://", "")}`;
  }
  return uri;
}

export async function fetchSolanaMetadata(uri?: string) {
  const httpUri = ipfsToHttp(uri);
  if (!httpUri) return undefined;
  const response = await fetch(httpUri, { cache: "force-cache" });
  if (!response.ok) return undefined;
  const metadata = await response.json() as { name?: string; image?: string; attributes?: Array<{ trait_type: string; value: string | number }> };
  return { ...metadata, image: ipfsToHttp(metadata.image) };
}
