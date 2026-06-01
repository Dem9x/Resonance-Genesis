"use client";

export function MiniEnergyChart({ values = [18, 24, 20, 36, 42, 39, 58, 65, 62, 78, 86, 92] }: { values?: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-20 items-end gap-1.5">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="min-w-0 flex-1 rounded-t-full bg-gradient-to-t from-[var(--accent)] to-[var(--accent-2)] opacity-80 shadow-[0_0_14px_var(--glow)] transition-all duration-500 hover:opacity-100"
          style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
