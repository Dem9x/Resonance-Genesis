export function BackgroundResonance() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="archive-grid absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-24 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-[var(--accent)]/10 animate-pulse-ring" />
      <div className="absolute left-1/2 top-24 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-[var(--accent-2)]/10 animate-pulse-ring [animation-delay:1.2s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(3,5,11,0.86)_72%)]" />
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[var(--sand)]/60 shadow-[0_0_18px_var(--glow)]"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${12 + ((index * 19) % 72)}%`,
            opacity: 0.16 + (index % 5) * 0.08
          }}
        />
      ))}
    </div>
  );
}
