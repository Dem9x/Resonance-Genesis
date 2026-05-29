import { GalleryClient } from "@/components/GalleryClient";
import { SectionShell } from "@/components/SectionShell";

export default function GalleryPage() {
  return (
    <SectionShell eyebrow="Gallery" title="Chladni Node archive" copy="Search, filter, and inspect the current mock collection. Real token metadata can be plugged into this page through the same ChladniNode type.">
      <GalleryClient />
    </SectionShell>
  );
}
