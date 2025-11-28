import { Router, Request, Response } from "express";
import { characterDB } from "../database";
import { logger as mainLogger } from "../config";
import { getCacheValue, setCacheValue } from "../utils/cache";

const logger = mainLogger.createNamedLogger("API");
const router = Router();

// GET /api/statistics/online-players - Get online players history
router.get("/online-players", async (_req: Request, res: Response) => {
  try {
    const history = await characterDB.getOnlinePlayersHistory();
    res.json(history);
  } catch (error: unknown) {
    logger.error("Error fetching online players history", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: { message: "Failed to fetch online players history" },
    });
  }
});

// GET /api/statistics/online-players-last - Get latest online player count
router.get("/online-players-last", async (_req: Request, res: Response) => {
  try {
    const cacheKey = "stats:online-players-last";

    // Check cache first
    const cached = getCacheValue(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Fetch from database
    const latest = await characterDB.getOnlinePlayersLast();

    // Store in cache
    setCacheValue(cacheKey, latest);

    res.json(latest);
  } catch (error: unknown) {
    logger.error("Error fetching latest online players", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: { message: "Failed to fetch latest online players" },
    });
  }
});

// GET /api/statistics/character-counts - Get character counts by game mode
router.get("/character-counts", async (_req: Request, res: Response) => {
  try {
    const cacheKey = "stats:character-counts";

    // Check cache first
    const cached = getCacheValue(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Fetch from database
    const counts = await characterDB.getCharacterCounts();

    // Store in cache
    setCacheValue(cacheKey, counts);

    res.json(counts);
  } catch (error: unknown) {
    logger.error("Error fetching character counts", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: { message: "Failed to fetch character counts" },
    });
  }
});

export default router;
