"use client";

import { useState } from "react";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { globalConfigPda, nodeTraitsPda, stakePda, vaultAuthorityPda } from "@/solana/pda";
import { useSolanaProgram } from "@/solana/useSolanaProgram";

export function useStakeNode() {
  const wallet = useWallet();
  const { program, programId } = useSolanaProgram();
  const [loading, setLoading] = useState(false);

  return {
    stakeNode: async (mintAddress: string) => {
      if (!wallet.publicKey || !program || !programId) throw new Error("Connect a Solana wallet first.");
      setLoading(true);
      try {
        const nftMint = new PublicKey(mintAddress);
        const globalConfig = globalConfigPda();
        const nodeTraits = nodeTraitsPda(nftMint);
        const vaultAuthority = vaultAuthorityPda();
        const stakeAccount = stakePda(nftMint);
        if (!globalConfig || !nodeTraits || !vaultAuthority || !stakeAccount) throw new Error("Solana program is not configured.");
        const userNftAccount = getAssociatedTokenAddressSync(nftMint, wallet.publicKey);
        const [vaultNftAccount] = PublicKey.findProgramAddressSync([Buffer.from("vault"), nftMint.toBuffer()], programId);
        return program.methods
          .stakeNode()
          .accounts({
            owner: wallet.publicKey,
            globalConfig,
            nftMint,
            nodeTraits,
            userNftAccount,
            vaultNftAccount,
            vaultAuthority,
            stakeAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .rpc();
      } finally {
        setLoading(false);
      }
    },
    unstakeNode: async (mintAddress: string) => {
      if (!wallet.publicKey || !program || !programId) throw new Error("Connect a Solana wallet first.");
      setLoading(true);
      try {
        const nftMint = new PublicKey(mintAddress);
        const globalConfig = globalConfigPda();
        const vaultAuthority = vaultAuthorityPda();
        const stakeAccount = stakePda(nftMint);
        if (!globalConfig || !vaultAuthority || !stakeAccount) throw new Error("Solana program is not configured.");
        const userNftAccount = getAssociatedTokenAddressSync(nftMint, wallet.publicKey);
        const [vaultNftAccount] = PublicKey.findProgramAddressSync([Buffer.from("vault"), nftMint.toBuffer()], programId);
        return program.methods
          .unstakeNode()
          .accounts({
            owner: wallet.publicKey,
            globalConfig,
            nftMint,
            userNftAccount,
            vaultNftAccount,
            vaultAuthority,
            stakeAccount,
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
