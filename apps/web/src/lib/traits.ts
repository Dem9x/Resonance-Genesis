import type { NodeTraits } from "@/types/node";

export function normalizeNodeTraits(value: unknown): NodeTraits | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return {
      frequency: Number(value[0] || 0),
      modeN: Number(value[1] || 0),
      modeM: Number(value[2] || 0),
      nodeDensityBps: Number(value[3] || 0),
      lineThicknessBps: Number(value[4] || 0),
      rarityTier: Number(value[5] || 0)
    };
  }

  if (typeof value === "object") {
    const traits = value as Partial<NodeTraits>;
    return {
      frequency: Number(traits.frequency || 0),
      modeN: Number(traits.modeN || 0),
      modeM: Number(traits.modeM || 0),
      nodeDensityBps: Number(traits.nodeDensityBps || 0),
      lineThicknessBps: Number(traits.lineThicknessBps || 0),
      rarityTier: Number(traits.rarityTier || 0)
    };
  }

  return undefined;
}
