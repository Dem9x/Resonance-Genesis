import type { SolanaNodeTraits, SolanaStakeState } from "@/solana/types";

export function rarityMultiplier(rarityTier = 0) {
  return [100, 115, 135, 165, 210, 280][rarityTier] || 100;
}

export function hashrateFromTraits(traits?: SolanaNodeTraits) {
  if (!traits?.initialized) return 0;
  const frequencyWeight = Math.floor(Math.sqrt(traits.frequency)) * 100;
  const delta = Math.abs(traits.modeN - traits.modeM);
  const modeComplexity = traits.modeN * traits.modeM + delta * 3;
  const symmetryBonus = delta <= 1 ? 500 : delta <= 3 ? 250 : 0;
  const base =
    frequencyWeight +
    modeComplexity * 40 +
    traits.nodeDensityBps * 3 +
    traits.lineThicknessBps * 2 +
    symmetryBonus;
  return Math.floor((base * rarityMultiplier(traits.rarityTier)) / 100);
}

export function pendingReFromState(traits?: SolanaNodeTraits, stake?: SolanaStakeState, energyScale = 86_400) {
  if (!traits?.initialized || !stake?.active) return 0;
  const elapsed = Math.max(0, Math.floor(Date.now() / 1000) - stake.lastClaimAt);
  return (hashrateFromTraits(traits) * elapsed) / Math.max(1, energyScale);
}
