import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type CachedNode = {
  tokenId: number;
  mint: string;
  ownerTokenAccount: string;
  metadata?: string;
  masterEdition?: string;
  metadataUri?: string;
  frequency: number;
  modeN: number;
  modeM: number;
  nodeDensityBps: number;
  lineThicknessBps: number;
  rarityTier: number;
  patternFamilyHash: number;
};

export type DevnetCache = {
  programId?: string;
  reMintAddress?: string;
  reMintAuthorityPda?: string;
  collectionMint?: string;
  collectionTokenAccount?: string;
  collectionMetadata?: string;
  collectionMasterEdition?: string;
  collectionMetadataUri?: string;
  globalConfig?: string;
  initializedSignature?: string;
  sampleNodes?: CachedNode[];
};

const cachePath = path.resolve(process.cwd(), ".cache", "solana-devnet.json");

export const programId = new PublicKey(
  process.env.RESONANCE_SOLANA_PROGRAM_ID ||
    process.env.NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID ||
    "bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7",
);

export const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
export const keypairPath = process.env.SOLANA_KEYPAIR || `${os.homedir()}/.config/solana/id.json`;

export function loadPayer() {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8"))));
}

export function loadCache(): DevnetCache {
  if (!fs.existsSync(cachePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(cachePath, "utf8")) as DevnetCache;
}

export function saveCache(next: DevnetCache) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify({ ...loadCache(), ...next, programId: programId.toBase58() }, null, 2));
}

export function metadataPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  );
}

export function masterEditionPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
    TOKEN_METADATA_PROGRAM_ID,
  );
}

export function metadataUriFor(tokenId: number) {
  if (process.env.METADATA_URI) {
    return process.env.METADATA_URI;
  }
  if (process.env.METADATA_BASE_URI) {
    return `${process.env.METADATA_BASE_URI.replace(/\/$/, "")}/${tokenId}.json`;
  }
  if (process.env.METADATA_CID) {
    return `ipfs://${process.env.METADATA_CID}/${tokenId}.json`;
  }
  return `https://mild-fuchsia-loon.myfilebase.com/ipfs/${tokenId}.json`;
}

export function collectionMetadataUri() {
  if (process.env.COLLECTION_METADATA_URI) {
    return process.env.COLLECTION_METADATA_URI;
  }
  if (process.env.METADATA_CID) {
    return `ipfs://${process.env.METADATA_CID}/collection.json`;
  }
  return "https://mild-fuchsia-loon.myfilebase.com/ipfs/QmToSLPP3AuieHXnZW7vAATQLnBLmgjkJ5UJGbVXh9Vno1/1.json";
}

export async function createNftMetadata(args: {
  connection: Connection;
  payer: Keypair;
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  collectionMint?: PublicKey;
}) {
  const [metadata] = metadataPda(args.mint);
  const [masterEdition] = masterEditionPda(args.mint);
  const collection = args.collectionMint ? { verified: false, key: args.collectionMint } : null;
  const transaction = new Transaction().add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata,
        mint: args.mint,
        mintAuthority: args.payer.publicKey,
        payer: args.payer.publicKey,
        updateAuthority: args.payer.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: args.name,
            symbol: args.symbol,
            uri: args.uri,
            sellerFeeBasisPoints: 0,
            creators: [{ address: args.payer.publicKey, verified: true, share: 100 }],
            collection,
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
        mint: args.mint,
        updateAuthority: args.payer.publicKey,
        mintAuthority: args.payer.publicKey,
        payer: args.payer.publicKey,
        metadata,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      {
        createMasterEditionArgs: {
          maxSupply: new anchor.BN(0),
        },
      },
    ),
  );

  const signature = await sendAndConfirmTransaction(args.connection, transaction, [args.payer], {
    commitment: "confirmed",
  });

  return {
    metadata,
    masterEdition,
    signature,
  };
}

export function getConnection() {
  return new Connection(rpcUrl, "confirmed");
}

export function getProvider() {
  const connection = getConnection();
  const payer = loadPayer();
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);
  return { connection, payer, provider };
}

export function getProgram(provider: anchor.AnchorProvider) {
  const idlPath = path.resolve(process.cwd(), "target", "idl", "resonance_genesis.json");
  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}. Run anchor build first.`);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  idl.address = programId.toBase58();
  return new anchor.Program(idl as anchor.Idl, provider);
}

export function globalConfigPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("global_config")], programId);
}

export function reMintAuthorityPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("re_mint_authority")], programId);
}

export function vaultAuthorityPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("vault_authority")], programId);
}

export function nodeTraitsPda(nftMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("node_traits"), nftMint.toBuffer()], programId);
}

export function stakePda(nftMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("stake"), nftMint.toBuffer()], programId);
}

export const systemProgram = SystemProgram.programId;
export const rentSysvar = SYSVAR_RENT_PUBKEY;
