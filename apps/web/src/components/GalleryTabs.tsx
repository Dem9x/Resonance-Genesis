"use client";

export type GalleryTab = "all" | "owned" | "staked";

const labels: Record<GalleryTab, string> = {
  all: "All Nodes",
  owned: "Owned",
  staked: "Staked"
};

export function GalleryTabs({
  active,
  counts,
  onChange
}: {
  active: GalleryTab;
  counts: Record<GalleryTab, number>;
  onChange: (tab: GalleryTab) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-[var(--panel-border)] bg-[var(--panel)] p-1 shadow-[0_0_24px_var(--glow)]">
      {(Object.keys(labels) as GalleryTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
            active === tab ? "theme-button" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]"
          }`}
        >
          {labels[tab]} <span className="ml-1 opacity-70">{counts[tab]}</span>
        </button>
      ))}
    </div>
  );
}
