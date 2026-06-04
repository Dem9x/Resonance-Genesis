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
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  mintPriceLamports,
  nftRoyaltyBps,
  optionalPublicKey,
  resonanceProgramId,
  solanaCreatorAddress,
  solanaCreatorTreasury,
  solanaMetadataBaseUri,
  solanaMetadataCid,
} from "@/solana/constants";
import { globalConfigPda, mintRecordPda, nodeTraitsPda } from "@/solana/pda";
import { fetchSolanaMetadata } from "@/solana/metadata";

export type SolanaMintResult = {
  signature: string;
  tokenId: number;
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

function readU64Le(data: Buffer, offset: number) {
  return Number(data.readBigUInt64LE(offset));
}

async function readMintCounter(connection: Connection) {
  const globalConfig = globalConfigPda();
  if (!globalConfig) throw new Error("Solana program is not configured.");
  const account = await connection.getAccountInfo(globalConfig, "confirmed");
  if (!account) throw new Error("GlobalConfig is missing. Initialize the Solana program first.");
  const data = Buffer.from(account.data);
  const minUpgradedLen = 8 + 32 * 4 + 8 * 7 + 1;
  if (data.length < minUpgradedLen) {
    throw new Error("GlobalConfig still uses the old layout. Run npm run migrate-global-config, then reload this page.");
  }
  const nextTokenIdOffset = 8 + 32 * 4 + 8 * 4;
  const nextTokenId = readU64Le(data, nextTokenIdOffset);
  const maxSupply = readU64Le(data, nextTokenIdOffset + 8);
  const mintedCount = readU64Le(data, nextTokenIdOffset + 16);
  if (!Number.isFinite(nextTokenId) || nextTokenId <= 0) throw new Error("Invalid on-chain next token id.");
  if (nextTokenId > maxSupply) throw new Error("Chladni Node collection is sold out.");
  return { globalConfig, nextTokenId, maxSupply, mintedCount };
}

function hashUriToU32(input: string) {
  return input.split("").reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7) >>> 0;
}

function attributeValue(
  attributes: Array<{ trait_type: string; value: string | number }> | undefined,
  traitType: string,
) {
  return attributes?.find((item) => item.trait_type === traitType)?.value;
}

function numericAttribute(
  attributes: Array<{ trait_type: string; value: string | number }> | undefined,
  traitType: string,
) {
  const value = attributeValue(attributes, traitType);
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function rarityIndex(attributes: Array<{ trait_type: string; value: string | number }> | undefined) {
  const byIndex = numericAttribute(attributes, "Rarity Index");
  if (byIndex > 0) return byIndex;
  const name = String(attributeValue(attributes, "Rarity Tier") || "Common");
  return Math.max(0, ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"].indexOf(name));
}

async function traitsForMetadata(tokenId: number, metadataUri: string) {
  const json = await fetchSolanaMetadata(metadataUri);
  const attributes = json?.attributes;
  const frequency = numericAttribute(attributes, "Frequency");
  const modeN = numericAttribute(attributes, "Mode N");
  const modeM = numericAttribute(attributes, "Mode M");
  const nodeDensityBps =
    numericAttribute(attributes, "Node Density BPS") ||
    Math.round(numericAttribute(attributes, "Node Density") * 10_000);
  const lineThicknessBps =
    numericAttribute(attributes, "Line Thickness BPS") ||
    Math.round(numericAttribute(attributes, "Line Thickness") * 100);
  const rarityTier = rarityIndex(attributes);
  if (!frequency || !modeN || !modeM || !nodeDensityBps || !lineThicknessBps) {
    throw new Error(`Metadata traits are missing for Chladni Node #${tokenId}. Check ${metadataUri}`);
  }
  return {
    frequency,
    modeN,
    modeM,
    nodeDensityBps,
    lineThicknessBps,
    rarityTier,
    patternFamilyHash: hashUriToU32(`scientific-${tokenId}-${modeN}-${modeM}`),
  };
}

async function anchorDiscriminator(name: string) {
  const encoded = new TextEncoder().encode(`global:${name}`);
  const payload = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return Buffer.from(digest).subarray(0, 8);
}

async function createRegisterNodeMintInstruction({
  owner,
  globalConfig,
  tokenId,
  mint,
  metadataUri,
  traits,
}: {
  owner: PublicKey;
  globalConfig: PublicKey;
  tokenId: number;
  mint: PublicKey;
  metadataUri: string;
  traits: Awaited<ReturnType<typeof traitsForMetadata>>;
}) {
  const programId = optionalPublicKey(resonanceProgramId);
  if (!programId) throw new Error("Solana program is not configured.");
  const mintRecord = mintRecordPda(tokenId);
  const nodeTraits = nodeTraitsPda(mint);
  if (!mintRecord) throw new Error("Unable to derive MintRecord PDA.");
  if (!nodeTraits) throw new Error("Unable to derive NodeTraits PDA.");
  const data = Buffer.alloc(8 + 8 + 32 + 4 + 4 + 1 + 1 + 2 + 2 + 1 + 4);
  (await anchorDiscriminator("register_node_mint")).copy(data, 0);
  data.writeBigUInt64LE(BigInt(tokenId), 8);
  mint.toBuffer().copy(data, 16);
  data.writeUInt32LE(hashUriToU32(metadataUri), 48);
  data.writeUInt32LE(traits.frequency, 52);
  data.writeUInt8(traits.modeN, 56);
  data.writeUInt8(traits.modeM, 57);
  data.writeUInt16LE(traits.nodeDensityBps, 58);
  data.writeUInt16LE(traits.lineThicknessBps, 60);
  data.writeUInt8(traits.rarityTier, 62);
  data.writeUInt32LE(traits.patternFamilyHash, 63);

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: globalConfig, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: mintRecord, isSigner: false, isWritable: true },
      { pubkey: nodeTraits, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
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
  const { globalConfig, nextTokenId } = await readMintCounter(connection);
  const tokenId = nextTokenId;
  const metadataUri = metadataUriFor(tokenId);
  const traits = await traitsForMetadata(tokenId, metadataUri);
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  const creator = optionalPublicKey(solanaCreatorAddress) || payer;
  const creatorVerified = creator.equals(payer);
  const treasury = optionalPublicKey(solanaCreatorTreasury);
  const royaltyBps = Number.isFinite(nftRoyaltyBps) ? Math.max(0, Math.min(10_000, nftRoyaltyBps)) : 500;
  if (mintPriceLamports > 0 && !treasury) {
    throw new Error("Creator treasury is required when primary mint fee is enabled.");
  }

  const transaction = new Transaction();
  if (treasury && mintPriceLamports > 0) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: treasury,
        lamports: mintPriceLamports,
      }),
    );
  }

  transaction.add(
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
            sellerFeeBasisPoints: royaltyBps,
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
    await createRegisterNodeMintInstruction({
      owner: payer,
      globalConfig,
      tokenId,
      mint: mint.publicKey,
      metadataUri,
      traits,
    }),
  );

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  transaction.feePayer = payer;
  transaction.recentBlockhash = latestBlockhash.blockhash;

  const signature = await sendTransaction(transaction, connection, { signers: [mint] });
  await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

  return {
    signature,
    tokenId,
    mint: mint.publicKey.toBase58(),
    tokenAccount: tokenAccount.toBase58(),
    metadata: metadata.toBase58(),
    masterEdition: masterEdition.toBase58(),
    metadataUri,
  };
}
