import { solanaImageCid, solanaImageFallbackCount } from "@/solana/constants";

export function ipfsToHttp(uri?: string) {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.filebase.io/ipfs/";
    return `${gateway.replace(/\/$/, "")}/${uri.replace("ipfs://", "")}`;
  }
  return uri;
}

export function tokenIdFromMetadataUri(uri?: string) {
  if (!uri) return undefined;
  return uri.match(/\/(\d+)\.json(?:$|\?)/)?.[1];
}

export function fallbackImageFromMetadataUri(uri?: string) {
  const tokenId = tokenIdFromMetadataUri(uri);
  if (!tokenId || !solanaImageCid) return undefined;
  return ipfsToHttp(`ipfs://${solanaImageCid}/${tokenId}.png`);
}

export function fallbackImageForMint(mint: string, uri?: string) {
  const uriFallback = fallbackImageFromMetadataUri(uri);
  if (uriFallback) return uriFallback;
  if (!solanaImageCid) return undefined;
  const bucket =
    mint.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    Math.max(1, solanaImageFallbackCount);
  return ipfsToHttp(`ipfs://${solanaImageCid}/${bucket + 1}.png`);
}

export function fallbackImagesForMint(mint: string, uri?: string) {
  const first = fallbackImageForMint(mint, uri);
  if (!solanaImageCid) return first ? [first] : [];
  const count = Math.max(1, solanaImageFallbackCount);
  const start = mint.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % count;
  const urls = Array.from({ length: Math.min(count, 6) }, (_, index) => {
    const tokenId = ((start + index) % count) + 1;
    return ipfsToHttp(`ipfs://${solanaImageCid}/${tokenId}.png`);
  }).filter(Boolean) as string[];
  return [...new Set([first, ...urls].filter(Boolean) as string[])];
}

export async function fetchSolanaMetadata(uri?: string) {
  const httpUri = ipfsToHttp(uri);
  if (!httpUri) return undefined;
  try {
    const response = await fetch(httpUri, { cache: "force-cache" });
    if (!response.ok) {
      return { image: fallbackImageFromMetadataUri(uri) };
    }
    const metadata = await response.json() as { name?: string; image?: string; tokenId?: number; hashratePreview?: number; attributes?: Array<{ trait_type: string; value: string | number }> };
    return { ...metadata, image: ipfsToHttp(metadata.image) || fallbackImageFromMetadataUri(uri) };
  } catch {
    return { image: fallbackImageFromMetadataUri(uri) };
  }
}
