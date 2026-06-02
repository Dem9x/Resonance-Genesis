import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type CachedNode = {
  tokenId: number;
  mint: string;
  ownerTokenAccount: string;
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

