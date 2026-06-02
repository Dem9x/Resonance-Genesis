import * as anchor from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, type Connection } from "@solana/web3.js";
import { Metadata, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { fetchSolanaMetadata } from "@/solana/metadata";
import { hashrateFromTraits, pendingReFromState } from "@/solana/hashrate";
import { nodeTraitsPda, stakePda } from "@/solana/pda";
import type { SolanaNode, SolanaNodeTraits, SolanaStakeState } from "@/solana/types";

type ProgramWithAccounts = anchor.Program & {
  account: {
    nodeTraits: {
      fetch: (address: PublicKey) => Promise<Record<string, unknown>>;
    };
    stakeAccount: {
      fetch: (address: PublicKey) => Promise<Record<string, unknown>>;
      all: (filters?: unknown[]) => Promise<Array<{ publicKey: PublicKey; account: Record<string, unknown> }>>;
    };
  };
};

function metadataPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

function bnToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (value && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value || 0);
}

function clean(value?: string) {
  return value?.replace(/\u0000/g, "").trim();
}

export async function loadMetadataForMint(connection: Connection, mint: PublicKey) {
  const metadataAddress = metadataPda(mint);
  try {
    const account = await Metadata.fromAccountAddress(connection, metadataAddress);
    const uri = clean(account.data.uri);
    const json = await fetchSolanaMetadata(uri);
    return {
      metadataAddress: metadataAddress.toBase58(),
      metadataUri: uri,
      name: json?.name || clean(account.data.name),
      image: json?.image,
    };
  } catch {
    return {
      metadataAddress: metadataAddress.toBase58(),
      name: `Chladni Node ${mint.toBase58().slice(0, 6)}`,
    };
  }
}

export async function loadTraits(program: anchor.Program, mint: PublicKey): Promise<SolanaNodeTraits | undefined> {
  const traitsPda = nodeTraitsPda(mint);
  if (!traitsPda) return undefined;
  try {
    const account = await (program as ProgramWithAccounts).account.nodeTraits.fetch(traitsPda);
    return {
      nftMint: (account.nftMint as PublicKey).toBase58(),
      frequency: bnToNumber(account.frequency),
      modeN: bnToNumber(account.modeN),
      modeM: bnToNumber(account.modeM),
      nodeDensityBps: bnToNumber(account.nodeDensityBps),
      lineThicknessBps: bnToNumber(account.lineThicknessBps),
      rarityTier: bnToNumber(account.rarityTier),
      initialized: Boolean(account.initialized),
    };
  } catch {
    return undefined;
  }
}

export async function loadStake(program: anchor.Program, mint: PublicKey): Promise<SolanaStakeState | undefined> {
  const pda = stakePda(mint);
  if (!pda) return undefined;
  try {
    const account = await (program as ProgramWithAccounts).account.stakeAccount.fetch(pda);
    return {
      owner: (account.owner as PublicKey).toBase58(),
      nftMint: (account.nftMint as PublicKey).toBase58(),
      stakedAt: bnToNumber(account.stakedAt),
      lastClaimAt: bnToNumber(account.lastClaimAt),
      claimedRe: bnToNumber(account.claimedRe) / 1_000_000_000,
      active: Boolean(account.active),
    };
  } catch {
    return undefined;
  }
}

export async function scanSolanaNodes({
  connection,
  program,
  owner,
}: {
  connection: Connection;
  program: anchor.Program;
  owner: PublicKey;
}): Promise<SolanaNode[]> {
  const ownedTokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });
  const ownedMints = ownedTokenAccounts.value
    .map((entry) => {
      const info = entry.account.data.parsed.info;
      const amount = info.tokenAmount;
      if (amount.decimals !== 0 || amount.uiAmount !== 1) return undefined;
      return { mint: new PublicKey(info.mint as string), tokenAccount: entry.pubkey.toBase58() };
    })
    .filter(Boolean) as Array<{ mint: PublicKey; tokenAccount: string }>;

  const stakeAccounts = await (program as ProgramWithAccounts).account.stakeAccount.all([
    {
      memcmp: {
        offset: 8,
        bytes: owner.toBase58(),
      },
    },
  ]);
  const stakedMints = stakeAccounts
    .map((entry: { account: Record<string, unknown> }) => ({
      mint: entry.account.nftMint as PublicKey,
      stake: {
        owner: (entry.account.owner as PublicKey).toBase58(),
        nftMint: (entry.account.nftMint as PublicKey).toBase58(),
        stakedAt: bnToNumber(entry.account.stakedAt),
        lastClaimAt: bnToNumber(entry.account.lastClaimAt),
        claimedRe: bnToNumber(entry.account.claimedRe) / 1_000_000_000,
        active: Boolean(entry.account.active),
      } satisfies SolanaStakeState,
    }))
    .filter((entry: { stake: SolanaStakeState }) => entry.stake.active);

  const byMint = new Map<string, { mint: PublicKey; tokenAccount?: string; stake?: SolanaStakeState }>();
  for (const owned of ownedMints) byMint.set(owned.mint.toBase58(), owned);
  for (const staked of stakedMints) byMint.set(staked.mint.toBase58(), { ...byMint.get(staked.mint.toBase58()), ...staked });

  const nodes = await Promise.all(
    [...byMint.values()].map(async (entry): Promise<SolanaNode> => {
      const [metadata, traits, stake] = await Promise.all([
        loadMetadataForMint(connection, entry.mint),
        loadTraits(program, entry.mint),
        entry.stake ? Promise.resolve(entry.stake) : loadStake(program, entry.mint),
      ]);
      const activeStake = stake?.active ? stake : undefined;
      return {
        mint: entry.mint.toBase58(),
        tokenAccount: entry.tokenAccount,
        ...metadata,
        traits,
        stake: activeStake,
        status: activeStake ? "Staked" : entry.tokenAccount ? "Owned" : "Unknown",
        hashrate: hashrateFromTraits(traits),
        claimableRe: pendingReFromState(traits, activeStake),
      };
    }),
  );

  return nodes.sort((a, b) => a.mint.localeCompare(b.mint));
}
