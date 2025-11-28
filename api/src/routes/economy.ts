import { Router, Request, Response } from "express";
import { economyDB } from "../database";
import { validateSeason } from "../middleware/validation";
import { config, logger as mainLogger } from "../config";
import { getCacheValue, setCacheValue } from "../utils/cache";

const logger = mainLogger.createNamedLogger("API");
const router = Router();

// GET /api/economy/items - Get unique item names
router.get("/items", validateSeason, async (req: Request, res: Response) => {
  try {
    const { season } = req.query;
    const seasonNumber = season
      ? parseInt(season as string, 10)
      : config.currentSeason;
    const cacheKey = `economy:items:${seasonNumber}`;

    // Check cache first
    const cached = getCacheValue(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Fetch from database
    const items = await economyDB.getUniqueItemNames(seasonNumber);

    // Store in cache
    setCacheValue(cacheKey, items);

    res.json(items);
  } catch (error: unknown) {
    logger.error("Error fetching item names", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: { message: "Failed to fetch item names" },
    });
  }
});

// GET /api/economy/listings/:itemName - Get listings for an item
router.get(
  "/listings/:itemName",
  validateSeason,
  async (req: Request, res: Response) => {
    try {
      const { itemName } = req.params;
      const { date, ingestionDate, season } = req.query;
      const seasonNumber = season ? parseInt(season as string, 10) : undefined;

      if (!date && !ingestionDate) {
        res.status(400).json({
          error: {
            message: "Either date or ingestionDate query parameter is required",
          },
        });
        return;
      }

      let listings;

      if (date) {
        listings = await economyDB.getListingsByDataDate(
          itemName,
          date as string,
          seasonNumber
        );
      } else {
        listings = await economyDB.getListingsByIngestionDate(
          itemName,
          ingestionDate as string,
          seasonNumber
        );
      }

      res.json(listings);
    } catch (error: unknown) {
      logger.error("Error fetching listings", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: { message: "Failed to fetch listings" },
      });
    }
  }
);

// GET /api/economy/listings-count - Get total listings count
router.get(
  "/listings-count",
  validateSeason,
  async (req: Request, res: Response) => {
    try {
      const { season } = req.query;
      const seasonNumber = season
        ? parseInt(season as string, 10)
        : config.currentSeason;
      const cacheKey = `economy:listings-count:${seasonNumber}`;

      // Check cache first
      const cached = getCacheValue(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      // Fetch from database
      const total = await economyDB.getTotalListingsCount(seasonNumber);
      const response = { total };

      // Store in cache
      setCacheValue(cacheKey, response);

      res.json(response);
    } catch (error: unknown) {
      logger.error("Error fetching listings count", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: { message: "Failed to fetch listings count" },
      });
    }
  }
);

export default router;
