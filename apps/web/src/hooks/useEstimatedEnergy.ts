"use client";

import { useEffect, useMemo, useState } from "react";

export function useEstimatedEnergy({ baseEnergy = 0n, hashrate = 0n, isMining = false }: { baseEnergy?: bigint; hashrate?: bigint; isMining?: boolean }) {
  const [startedAt, setStartedAt] = useState(() => Date.now());

  useEffect(() => {
    setStartedAt(Date.now());
  }, [baseEnergy, hashrate, isMining]);

  const base = useMemo(() => Number(baseEnergy || 0n), [baseEnergy]);
  const ratePerSecond = useMemo(() => (isMining ? Number(hashrate || 0n) / 86_400 : 0), [hashrate, isMining]);
  const [display, setDisplay] = useState(base);

  useEffect(() => {
    let frame = 0;

    function tick() {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      setDisplay(base + ratePerSecond * elapsedSeconds);
      frame = requestAnimationFrame(tick);
    }

    tick();
    return () => cancelAnimationFrame(frame);
  }, [base, ratePerSecond, startedAt]);

  return display;
}
