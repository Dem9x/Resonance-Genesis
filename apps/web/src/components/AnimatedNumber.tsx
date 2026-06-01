"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number | bigint | undefined;
  decimals?: number;
  suffix?: string;
  className?: string;
};

export function AnimatedNumber({ value = 0, decimals = 0, suffix = "", className = "" }: AnimatedNumberProps) {
  const target = useMemo(() => (typeof value === "bigint" ? Number(value) : value || 0), [value]);
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    const to = target;
    const startedAt = performance.now();
    const duration = 720;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previous.current = to;
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <span className={className}>
      {display.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}
