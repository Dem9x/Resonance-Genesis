"use client";

import { SectionShell } from "@/components/SectionShell";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { SolanaNodeCard } from "@/components/solana/SolanaNodeCard";
import { useChladniNodes } from "@/solana/useChladniNodes";

export default function SolanaGalleryPage() {
  const { nodes, owner } = useChladniNodes();

  return (
    <SectionShell eyebrow="Solana Devnet Mode" title="Solana Chladni gallery" copy="Owned and staked Chladni Nodes from Solana Devnet appear here when the program and collection are configured.">
      {!owner ? (
        <div className="glass-panel rounded-[2rem] p-10 text-center">
          <p className="mb-5 text-[var(--muted)]">Connect a Solana wallet to scan Devnet Chladni Nodes.</p>
          <SolanaConnectButton />
        </div>
      ) : nodes.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => <SolanaNodeCard key={node.mint} node={node} />)}
        </div>
      ) : (
        <div className="glass-panel rounded-[2rem] p-10 text-center text-[var(--muted)]">No Solana Chladni Nodes detected yet.</div>
      )}
    </SectionShell>
  );
}
