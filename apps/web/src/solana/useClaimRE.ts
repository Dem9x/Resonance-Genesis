"use client";

export function useClaimRE() {
  return {
    claimRE: async () => {
      throw new Error("Claim transaction wiring requires deployed Solana program ID and generated Anchor IDL.");
    },
    loading: false
  };
}
