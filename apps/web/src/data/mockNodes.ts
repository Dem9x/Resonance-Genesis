import type { ChladniNode } from "@/types/node";

const families = ["Radial Lattice", "Spiral Harmonic", "Axial Bloom", "Crown Interference", "Orbital Mesh", "Vortex Plate"];
const gradients = ["Cyan/Violet", "Ember/Magenta", "Mint/Azure", "Solar/Iris", "Aurora/Indigo", "Rose/Plasma"];
const architectures = ["Hexa Node", "Twin Axis", "Fractal Ring", "Quad Chamber", "Signal Crown", "Wave Gate"];
const rarities: ChladniNode["rarityTier"][] = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
const statuses: ChladniNode["miningStatus"][] = ["Idle", "Mining", "Cooling Down"];

export const mockNodes: ChladniNode[] = Array.from({ length: 24 }, (_, index) => {
  const tokenId = index + 1;
  const rarityTier = rarities[(index + Math.floor(index / 5)) % rarities.length];
  const isStaked = index % 3 !== 0;
  const miningStatus = isStaked ? statuses[(index + 1) % statuses.length] : "Idle";

  return {
    tokenId,
    name: `Chladni Node #${tokenId.toString().padStart(3, "0")}`,
    image: `/nodes/${tokenId}.png`,
    frequency: 174 + ((index * 73) % 852),
    modeN: 2 + (index % 8),
    modeM: 3 + ((index * 2) % 9),
    patternFamily: families[index % families.length],
    backgroundGradient: gradients[(index * 2) % gradients.length],
    nodeArchitecture: architectures[(index * 3) % architectures.length],
    rarityTier,
    isStaked,
    miningStatus,
    resonanceEnergy: 180 + index * 47 + (isStaked ? 320 : 0),
    energyPerDay: 18 + index * 2 + (rarities.indexOf(rarityTier) * 7)
  };
});

export const getNodeById = (id: number) => mockNodes.find((node) => node.tokenId === id);
