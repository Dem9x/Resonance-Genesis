"use client";

export function AnimatedProgressBar({ value, max = 100, className = "" }: { value: number | bigint | undefined; max?: number; className?: string }) {
  const numeric = typeof value === "bigint" ? Number(value) : value || 0;
  const percent = Math.max(2, Math.min(100, Math.round((numeric / max) * 100)));

  return (
    <div className={`relative h-3 overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className="relative h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] transition-[width] duration-700 ease-out"
        style={{ width: `${percent}%` }}
      >
        <span className="absolute inset-0 animate-[shimmer_1.8s_linear_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.28),transparent)]" />
        <span className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--sand)] opacity-80 blur-sm" />
      </div>
    </div>
  );
}
