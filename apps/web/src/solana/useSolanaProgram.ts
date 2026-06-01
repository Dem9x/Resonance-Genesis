"use client";

import { PublicKey } from "@solana/web3.js";
import { resonanceProgramId } from "@/solana/constants";

export function useSolanaProgram() {
  const configured = Boolean(resonanceProgramId);
  return {
    configured,
    programId: configured ? new PublicKey(resonanceProgramId) : undefined
  };
}
