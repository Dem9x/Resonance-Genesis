import type { Request, Response } from "express";
import { WaitlistService } from "../services/waitlist.service";
import { validateWaitlistJoin } from "../validation/waitlist.schema";

export function waitlistController(service: WaitlistService) {
  return {
    join: async (request: Request, response: Response) => {
      const validationError = validateWaitlistJoin(request.body);
      if (validationError) return response.status(400).json({ error: validationError });
      const result = await service.join(request.body);
      return response.status(result.alreadyJoined ? 409 : 201).json(result);
    },
    stats: async (_request: Request, response: Response) => {
      const targetSlots = Number(process.env.WAITLIST_TARGET_SLOTS || 1000);
      const launchTimestamp = process.env.WAITLIST_TARGET_DATE || "2026-06-30T12:00:00Z";
      return response.json(await service.stats(targetSlots, launchTimestamp));
    }
  };
}
