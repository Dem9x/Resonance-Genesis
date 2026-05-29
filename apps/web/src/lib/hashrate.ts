import type { NodeTraits, RarityTier } from "@/types/node";

export const rarityNames: RarityTier[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
export const rarityMultipliers = [100, 115, 135, 165, 210, 280] as const;
export const energyScaleSeconds = 86400;

export function integerSqrt(value: number) {
  if (value <= 0) return 0;
  let x = value;
  let y = Math.floor((x + 1) / 2);
  while (y < x) {
    x = y;
    y = Math.floor((value / y + y) / 2);
  }
  return x;
}

export function calculateHashrate(traits: NodeTraits) {
  const frequencyWeight = integerSqrt(traits.frequency) * 100;
  const modeDelta = Math.abs(traits.modeN - traits.modeM);
  const modeComplexity = traits.modeN * traits.modeM + modeDelta * 3;
  const symmetryBonus = modeDelta <= 1 ? 500 : modeDelta <= 3 ? 250 : 0;
  const baseHashrate =
    frequencyWeight +
    modeComplexity * 40 +
    traits.nodeDensityBps * 3 +
    traits.lineThicknessBps * 2 +
    symmetryBonus;

  const multiplier = rarityMultipliers[traits.rarityTier] || 100;
  return Math.floor((baseHashrate * multiplier) / 100);
}

export function rarityName(rarityTier: number): RarityTier {
  return rarityNames[rarityTier] || "Common";
}

export function attributeValue(attributes: { trait_type: string; value: string | number }[] | undefined, trait: string) {
  return attributes?.find((attribute) => attribute.trait_type === trait)?.value;
}
