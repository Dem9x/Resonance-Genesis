import { Router } from "express";
import type { Db } from "mongodb";
import { solanaController } from "../controllers/solana.controller";
import { SolanaService } from "../services/solana.service";

export function solanaRoutes(db: Db) {
  const router = Router();
  const controller = solanaController(new SolanaService(db));

  router.get("/health", controller.health);
  router.get("/re/stats", controller.reStats);
  router.get("/re/user/:wallet", controller.reUser);
  router.get("/nodes", controller.nodes);
  router.get("/nodes/:mint", controller.node);
  router.get("/stakes/:wallet", controller.stakes);
  router.post("/admin/sync-events", controller.syncEvents);
  router.post("/admin/cache-node/:mint", controller.cacheNode);

  return router;
}
