export const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.filebase.io/ipfs/";

export function ipfsToHttp(uri: string | undefined) {
  if (!uri) return "";
  if (uri.startsWith("https://") || uri.startsWith("http://")) return uri;
  if (!uri.startsWith("ipfs://")) return uri;

  const gateway = ipfsGateway.endsWith("/") ? ipfsGateway : `${ipfsGateway}/`;
  return `${gateway}${uri.replace("ipfs://", "")}`;
}

export async function fetchIpfsJson<T>(uri: string): Promise<T> {
  const response = await fetch(ipfsToHttp(uri));
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS JSON: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
