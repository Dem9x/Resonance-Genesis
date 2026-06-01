import { Router } from "express";
import type { Db } from "mongodb";
import { waitlistController } from "../controllers/waitlist.controller";
import { WaitlistService } from "../services/waitlist.service";

export function waitlistRoutes(db: Db) {
  const router = Router();
  const controller = waitlistController(new WaitlistService(db));

  router.post("/join", controller.join);
  router.get("/stats", controller.stats);

  return router;
}
