import { NodeDetailClient } from "@/components/NodeDetailClient";
import { SectionShell } from "@/components/SectionShell";

export default async function NodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <SectionShell eyebrow="Node Detail" title="Artifact metadata chamber">
      <NodeDetailClient tokenId={BigInt(id)} />
    </SectionShell>
  );
}
