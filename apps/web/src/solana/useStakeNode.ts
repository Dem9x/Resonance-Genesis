"use client";

export function useStakeNode() {
  return {
    stakeNode: async () => {
      throw new Error("Stake transaction wiring requires deployed Solana program ID and generated Anchor IDL.");
    },
    unstakeNode: async () => {
      throw new Error("Unstake transaction wiring requires deployed Solana program ID and generated Anchor IDL.");
    },
    loading: false
  };
}
