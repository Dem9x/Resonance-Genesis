import Link from "next/link";
import { Activity, Zap } from "lucide-react";
import { ipfsToHttp } from "@/lib/ipfs";
import { attributeValue } from "@/lib/hashrate";
import type { ChladniMetadata } from "@/types/node";

export function ContractNodeArtwork({ metadata, tokenId, large = false }: { metadata?: ChladniMetadata; tokenId: bigint; large?: boolean }) {
  const image = ipfsToHttp(metadata?.image);

  return (
    <div className={`relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-[var(--bg-soft)] via-[var(--accent)]/20 to-[var(--accent-2)]/30 ${large ? "aspect-square" : "aspect-[1.08]"}`}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={metadata?.name || `Chladni Node #${tokenId}`} className="h-full w-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 opacity-45 sand-field" />
          <div className="node-art absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[0.2px]" />
          <div className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--sand)]/50 animate-slow-spin" />
        </>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.48)_74%)]" />
      <p className="absolute left-4 top-4 rounded-full border border-[var(--panel-border)] bg-black/40 px-3 py-1 font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[var(--text)]">
        #{tokenId.toString().padStart(3, "0")}
      </p>
    </div>
  );
}

export function ContractNodeCard({
  tokenId,
  metadata,
  hashrate,
  pendingEnergy,
  isStaked
}: {
  tokenId: bigint;
  metadata?: ChladniMetadata;
  hashrate?: bigint;
  pendingEnergy?: bigint;
  isStaked?: boolean;
}) {
  const frequency = attributeValue(metadata?.attributes, "Frequency") || "On-chain";
  const mode = attributeValue(metadata?.attributes, "Mode") || "Traits";
  const rarity = attributeValue(metadata?.attributes, "Rarity Tier") || (isStaked ? "Mining" : "NODE");

  return (
    <Link href={`/node/${tokenId}`} className="group block">
      <article className="glass-panel overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50">
        <ContractNodeArtwork metadata={metadata} tokenId={tokenId} />
        <div className="rounded-b-2xl border-t border-white/10 bg-[var(--bg)]/80 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[var(--panel-border)] bg-[var(--accent)]/10 px-3 py-1 font-display text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
              {frequency}
            </span>
            <div className="min-w-0 text-center">
              <p className="font-display text-xs font-black uppercase tracking-[0.26em] text-[var(--text)]">Chladni Node</p>
              <p className="mt-1 truncate text-xs text-[var(--muted)]">{mode} / {metadata?.name || `Token #${tokenId}`}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[var(--panel-border)] bg-white/5 px-3 py-1 text-[0.66rem] font-bold text-[var(--accent-2)]">
              {String(rarity)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--accent)]" />
            {hashrate ? `${hashrate.toLocaleString()} H/s` : "Hashrate pending"}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Zap className="h-4 w-4 text-[var(--warning)]" />
            {pendingEnergy ? `${pendingEnergy.toLocaleString()} RE` : "0 RE"}
          </div>
        </div>
      </article>
    </Link>
  );
}
