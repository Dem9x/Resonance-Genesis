"use client";

import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  type Connection,
} from "@solana/web3.js";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { optionalPublicKey, solanaCreatorAddress, solanaMetadataBaseUri, solanaMetadataCid, solanaMintMetadataTokenId } from "@/solana/constants";

export type SolanaMintResult = {
  signature: string;
  mint: string;
  tokenAccount: string;
  metadata: string;
  masterEdition: string;
  metadataUri: string;
};

export type SendTransaction = (
  transaction: Transaction,
  connection: Connection,
  options?: { signers?: Keypair[] },
) => Promise<string>;

function metadataPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

function masterEditionPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

function metadataUriFor(tokenId: number) {
  if (solanaMetadataBaseUri) {
    return `${solanaMetadataBaseUri.replace(/\/$/, "")}/${tokenId}.json`;
  }
  if (solanaMetadataCid) {
    return `ipfs://${solanaMetadataCid}/${tokenId}.json`;
  }
  return "https://mild-fuchsia-loon.myfilebase.com/ipfs/QmeafH9WUZDqnnc27WjMrWouzFokCpSvVWwJu2wbxdCvLn";
}

export async function mintSolanaChladniNode({
  connection,
  payer,
  collectionMint,
  sendTransaction,
}: {
  connection: Connection;
  payer: PublicKey;
  collectionMint?: PublicKey;
  sendTransaction: SendTransaction;
}): Promise<SolanaMintResult> {
  const mint = Keypair.generate();
  const tokenAccount = getAssociatedTokenAddressSync(mint.publicKey, payer);
  const metadata = metadataPda(mint.publicKey);
  const masterEdition = masterEditionPda(mint.publicKey);
  const tokenId = Number.isFinite(solanaMintMetadataTokenId) && solanaMintMetadataTokenId > 0 ? solanaMintMetadataTokenId : 1;
  const metadataUri = metadataUriFor(tokenId);
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  const creator = optionalPublicKey(solanaCreatorAddress) || payer;
  const creatorVerified = creator.equals(payer);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(mint.publicKey, 0, payer, payer),
    createAssociatedTokenAccountInstruction(payer, tokenAccount, payer, mint.publicKey),
    createMintToInstruction(mint.publicKey, tokenAccount, payer, 1),
    createCreateMetadataAccountV3Instruction(
      {
        metadata,
        mint: mint.publicKey,
        mintAuthority: payer,
        payer,
        updateAuthority: payer,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "Chladni Node",
            symbol: "NODE",
            uri: metadataUri,
            sellerFeeBasisPoints: 0,
            creators: [{ address: creator, verified: creatorVerified, share: 100 }],
            collection: collectionMint ? { verified: false, key: collectionMint } : null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      },
    ),
    createCreateMasterEditionV3Instruction(
      {
        edition: masterEdition,
        mint: mint.publicKey,
        updateAuthority: payer,
        mintAuthority: payer,
        payer,
        metadata,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      {
        createMasterEditionArgs: {
          maxSupply: 0,
        },
      },
    ),
  );

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  transaction.feePayer = payer;
  transaction.recentBlockhash = latestBlockhash.blockhash;

  const signature = await sendTransaction(transaction, connection, { signers: [mint] });
  await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

  return {
    signature,
    mint: mint.publicKey.toBase58(),
    tokenAccount: tokenAccount.toBase58(),
    metadata: metadata.toBase58(),
    masterEdition: masterEdition.toBase58(),
    metadataUri,
  };
}
