import type { ReactNode } from "react";

export function TraitBadge({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        {icon ? <span className="text-archive-cyan">{icon}</span> : null}
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
