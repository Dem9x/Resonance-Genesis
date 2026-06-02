"use client";

import * as anchor from "@coral-xyz/anchor";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { resonanceProgramId } from "@/solana/constants";
import resonanceGenesisIdl from "@/solana/resonanceGenesisIdl.json";

export function useSolanaProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const configured = Boolean(resonanceProgramId);
  const programId = useMemo(() => (configured ? new PublicKey(resonanceProgramId) : undefined), [configured]);
  const provider = useMemo(
    () =>
      configured && wallet.publicKey
        ? new anchor.AnchorProvider(connection, wallet as unknown as anchor.Wallet, { commitment: "confirmed" })
        : undefined,
    [configured, connection, wallet],
  );
  const program = useMemo(
    () => (provider && programId ? new anchor.Program({ ...(resonanceGenesisIdl as anchor.Idl), address: programId.toBase58() }, provider) : undefined),
    [programId, provider],
  );

  return {
    configured,
    programId,
    provider,
    program
  };
}
