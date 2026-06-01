"use client";

import { useEstimatedEnergy } from "@/hooks/useEstimatedEnergy";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export function EstimatedEnergyNumber({
  baseEnergy,
  hashrate,
  isMining,
  suffix = " RE",
  className
}: {
  baseEnergy?: bigint;
  hashrate?: bigint;
  isMining?: boolean;
  suffix?: string;
  className?: string;
}) {
  const estimated = useEstimatedEnergy({ baseEnergy, hashrate, isMining });
  return <AnimatedNumber value={estimated} decimals={2} suffix={suffix} className={className} />;
}
