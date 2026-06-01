import type { Db } from "mongodb";

export class SolanaService {
  constructor(private db: Db) {}

  async health() {
    return {
      network: process.env.SOLANA_NETWORK || "devnet",
      rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
      programId: process.env.RESONANCE_SOLANA_PROGRAM_ID || "",
      reMint: process.env.RE_MINT_ADDRESS || "",
      collectionMint: process.env.CHLADNI_COLLECTION_MINT || ""
    };
  }

  async cachedNode(mint: string) {
    const [metadata, traits] = await Promise.all([
      this.db.collection("solanaNftMetadataCache").findOne({ mint }),
      this.db.collection("solanaNodeTraitsCache").findOne({ mint })
    ]);
    return { mint, metadata, traits };
  }

  async ownerNodes(owner: string) {
    return {
      owner,
      nodes: [],
      note: "Indexer cache placeholder. Solana program and SPL token accounts are source of truth."
    };
  }

  async stakes(wallet: string) {
    return this.db.collection("solanaStakeEvents").find({ wallet }).sort({ createdAt: -1 }).limit(100).toArray();
  }
}
