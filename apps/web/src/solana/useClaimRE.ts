"use client";

import { useState } from "react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { optionalPublicKey, reMintAddress } from "@/solana/constants";
import { globalConfigPda, nodeTraitsPda, reMintAuthorityPda, stakePda } from "@/solana/pda";
import { useSolanaProgram } from "@/solana/useSolanaProgram";

export function useClaimRE() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { program } = useSolanaProgram();
  const [loading, setLoading] = useState(false);

  return {
    claimRE: async (mintAddress: string) => {
      const reMint = optionalPublicKey(reMintAddress);
      if (!wallet.publicKey || !program || !reMint) throw new Error("Connect wallet and configure RE mint first.");
      setLoading(true);
      try {
        const nftMint = new PublicKey(mintAddress);
        const userReAccount = getAssociatedTokenAddressSync(reMint, wallet.publicKey);
        const existing = await connection.getAccountInfo(userReAccount);
        if (!existing) {
          const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              userReAccount,
              wallet.publicKey,
              reMint,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID,
            ),
          );
          await wallet.sendTransaction(tx, connection);
        }

        const globalConfig = globalConfigPda();
        const nodeTraits = nodeTraitsPda(nftMint);
        const stakeAccount = stakePda(nftMint);
        const reMintAuthority = reMintAuthorityPda();
        if (!globalConfig || !nodeTraits || !stakeAccount || !reMintAuthority) throw new Error("Solana program is not configured.");
        return program.methods
          .claimRe()
          .accounts({
            owner: wallet.publicKey,
            globalConfig,
            reMint,
            userReAccount,
            nodeTraits,
            stakeAccount,
            reMintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      } finally {
        setLoading(false);
      }
    },
    loading
  };
}
