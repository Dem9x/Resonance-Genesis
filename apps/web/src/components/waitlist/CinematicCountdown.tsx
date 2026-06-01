"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export function CinematicCountdown({ targetDate }: { targetDate: string }) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = Math.max(0, target - now);
  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="glass-panel scanlines relative overflow-hidden rounded-[2rem] p-5 md:p-6">
      <div className="absolute inset-0 opacity-30 sand-field" />
      <p className="relative font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Chladni Node Activation Window</p>
      <div className="relative mt-5 grid grid-cols-4 gap-3">
        <Digit label="Days" value={days} />
        <Digit label="Hours" value={hours} />
        <Digit label="Minutes" value={minutes} />
        <Digit label="Seconds" value={secs} />
      </div>
    </div>
  );
}

function Digit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/70 p-3 text-center shadow-[0_0_18px_var(--glow)]">
      <p className="font-mono text-3xl font-black text-[var(--text)] md:text-4xl">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
    </div>
  );
}
