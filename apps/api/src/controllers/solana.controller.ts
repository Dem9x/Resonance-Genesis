import type { Request, Response } from "express";
import { SolanaService } from "../services/solana.service";

export function solanaController(service: SolanaService) {
  return {
    health: async (_request: Request, response: Response) => response.json(await service.health()),
    reStats: async (_request: Request, response: Response) =>
      response.json({ maxSupply: 1_000_000_000, minClaimRe: 33, note: "Read SPL mint supply on-chain for production truth." }),
    reUser: async (request: Request, response: Response) =>
      response.json({ wallet: request.params.wallet, balance: 0, note: "Read user RE ATA on-chain for production truth." }),
    node: async (request: Request, response: Response) => response.json(await service.cachedNode(request.params.mint)),
    nodes: async (request: Request, response: Response) => response.json(await service.ownerNodes(String(request.query.owner || ""))),
    stakes: async (request: Request, response: Response) => response.json({ stakes: await service.stakes(request.params.wallet) }),
    syncEvents: async (_request: Request, response: Response) => response.json({ queued: true }),
    cacheNode: async (request: Request, response: Response) => response.json({ mint: request.params.mint, cached: false })
  };
}
