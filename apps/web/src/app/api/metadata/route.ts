import { NextResponse } from "next/server";
import { ipfsToHttp } from "@/lib/ipfs";
import type { ChladniMetadata } from "@/types/node";

const metadataCache = new Map<string, ChladniMetadata>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 80);

  if (!ids.length) {
    return NextResponse.json({ metadata: {} });
  }

  const metadataCid = process.env.NEXT_PUBLIC_METADATA_CID || process.env.METADATA_CID;
  if (!metadataCid) {
    return NextResponse.json({ metadata: {}, warning: "Metadata CID is not configured." });
  }

  const entries = await Promise.all(
    ids.map(async (id) => {
      const cached = metadataCache.get(id);
      if (cached) return [id, cached] as const;

      try {
        const response = await fetch(ipfsToHttp(`ipfs://${metadataCid}/${id}.json`), { next: { revalidate: 300 } });
        if (!response.ok) return null;
        const metadata = (await response.json()) as ChladniMetadata;
        metadataCache.set(id, metadata);
        return [id, metadata] as const;
      } catch {
        return null;
      }
    })
  );

  return NextResponse.json({
    metadata: Object.fromEntries(entries.filter(Boolean) as [string, ChladniMetadata][])
  });
}
