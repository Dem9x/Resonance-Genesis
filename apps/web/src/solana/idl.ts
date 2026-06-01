export const resonanceGenesisIdl = {
  address: process.env.NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID || "",
  metadata: {
    name: "resonance_genesis",
    version: "0.1.0",
    spec: "0.1.0"
  },
  instructions: []
} as const;
