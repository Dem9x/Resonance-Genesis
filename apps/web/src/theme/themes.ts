export type ThemeId =
  | "terminal-matrix-sand"
  | "sci-fi-archive"
  | "sand-gold-resonance"
  | "void-neon"
  | "classic-lab";

export const themes = [
  {
    id: "terminal-matrix-sand",
    name: "Terminal Matrix Sand",
    description: "Default dark matrix mining terminal with sand resonance accents."
  },
  {
    id: "sci-fi-archive",
    name: "Sci-Fi Archive",
    description: "Museum archive interface with cyan and violet resonance panels."
  },
  {
    id: "sand-gold-resonance",
    name: "Sand Gold Resonance",
    description: "Premium gold sand cymatics collector style."
  },
  {
    id: "void-neon",
    name: "Void Neon",
    description: "High contrast neon miner interface."
  },
  {
    id: "classic-lab",
    name: "Classic Lab",
    description: "Minimal scientific Chladni plate style."
  }
] as const satisfies readonly { id: ThemeId; name: string; description: string }[];

export const defaultTheme: ThemeId = "terminal-matrix-sand";
