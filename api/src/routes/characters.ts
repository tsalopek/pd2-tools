import { Router, Request, Response } from "express";
import { characterDB } from "../database";
import { validateSeason } from "../middleware/validation";
import { config, logger as mainLogger } from "../config";
import CharacterStatParser from "../utils/character-stats";

const logger = mainLogger.createNamedLogger("API");
const router = Router();

// GET /api/characters - Get filtered characters
router.get("/", validateSeason, async (req: Request, res: Response) => {
  try {
    const {
      gameMode = "softcore",
      page = "1",
      pageSize = "50",
      minLevel,
      maxLevel,
      classes,
      items,
      skills,
      season,
    } = req.query;

    const filter: Record<string, unknown> & {
      levelRange?: { min?: number; max?: number };
    } = {};

    if (minLevel || maxLevel) {
      filter.levelRange = {};
      if (minLevel) filter.levelRange.min = parseInt(minLevel as string, 10);
      if (maxLevel) filter.levelRange.max = parseInt(maxLevel as string, 10);
    }

    if (classes) {
      filter.requiredClasses = (classes as string).split(",");
    }

    if (items) {
      filter.requiredItems = (items as string).split(",");
    }
    if (skills) {
      try {
        const skillsData = JSON.parse(decodeURIComponent(skills as string));
        if (
          Array.isArray(skillsData) &&
          skillsData.every(
            (skill) =>
              typeof skill === "object" &&
              typeof skill.name === "string" &&
              typeof skill.minLevel === "number"
          )
        ) {
          filter.requiredSkills = skillsData;
        }
      } catch {
        // Invalid skills format, ignore
      }
    }
    if (season) {
      filter.season = parseInt(season as string, 10);
    } else {
      filter.season = config.currentSeason;
    }

    const result = await characterDB.getFilteredCharacters(
      gameMode as string,
      filter,
      parseInt(page as string, 10),
      parseInt(pageSize as string, 10)
    );

    res.json(result);
  } catch (error: unknown) {
    logger.error("Error fetching characters", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: { message: "Failed to fetch characters" },
    });
  }
});

// GET /api/characters/:name - Get character by name
router.get("/:name", validateSeason, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { gameMode = "softcore", season } = req.query;

    const seasonNumber = season
      ? parseInt(season as string, 10)
      : config.currentSeason;
    const MODES = ["hardcore", "softcore"];

    let character = await characterDB.getCharacterByName(
      gameMode as string,
      name,
      seasonNumber
    );

    // If not found in requested gameMode, try all other modes as fallback
    if (!character) {
      for (const otherGameMode of MODES) {
        if (otherGameMode === gameMode) continue; // Skip already-checked mode
        character = await characterDB.getCharacterByName(
          otherGameMode,
          name,
          seasonNumber
        );
        if (character) break;
      }
    }

    //TODO: pass season param and remove this
    if (!character) {
      for (const gm of MODES) {
        character = await characterDB.getCharacterByName(
          gm,
          name,
          seasonNumber - 1
        );
        if (character) break;
      }
    }

    if (!character) {
      res.status(404).json({ error: { message: "Character not found" } });
      return;
    }

    // Calculate realStats from items before returning
    if (character.items && character.items.length > 0) {
      // @ts-expect-error - character structure is validated by DB
      const statParser = new CharacterStatParser(character);
      character.realStats = statParser.parseAndGetCharStats();
    }

    res.json(character);
  } catch (error: unknown) {
    logger.error("Error fetching character", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: { message: "Failed to fetch character" },
    });
  }
});

// GET /api/characters/stats/level-distribution - Get level distribution
router.get(
  "/stats/level-distribution",
  validateSeason,
  async (_req: Request, res: Response) => {
    try {
      const { season } = _req.query;
      const seasonNumber = season ? parseInt(season as string, 10) : undefined;

      const distribution =
        await characterDB.getLevelDistributions(seasonNumber);
      res.json(distribution);
    } catch (error: unknown) {
      logger.error("Error fetching level distribution", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: { message: "Failed to fetch level distribution" },
      });
    }
  }
);

// GET /api/characters/stats/item-usage - Get item usage statistics
router.get(
  "/stats/item-usage",
  validateSeason,
  async (req: Request, res: Response) => {
    try {
      const {
        gameMode = "softcore",
        minLevel,
        maxLevel,
        classes,
        items,
        skills,
        season,
      } = req.query;

      const filter: Record<string, unknown> & {
        levelRange?: { min?: number; max?: number };
      } = {};

      if (minLevel || maxLevel) {
        filter.levelRange = {};
        if (minLevel) filter.levelRange.min = parseInt(minLevel as string, 10);
        if (maxLevel) filter.levelRange.max = parseInt(maxLevel as string, 10);
      }

      if (classes) {
        filter.requiredClasses = (classes as string).split(",");
      }

      if (items) {
        filter.requiredItems = (items as string)
          .split(",")
          .map((item) => item.trim());
      }

      if (skills) {
        try {
          const skillsData = JSON.parse(decodeURIComponent(skills as string));
          if (
            Array.isArray(skillsData) &&
            skillsData.every(
              (skill) =>
                typeof skill === "object" &&
                typeof skill.name === "string" &&
                typeof skill.minLevel === "number"
            )
          ) {
            filter.requiredSkills = skillsData;
          }
        } catch {
          // Invalid skills format, ignore
        }
      }

      if (season) {
        filter.season = parseInt(season as string, 10);
      } else {
        filter.season = config.currentSeason;
      }

      const itemUsage = await characterDB.analyzeItemUsage(
        gameMode as string,
        filter
      );
      res.json(itemUsage);
    } catch (error: unknown) {
      logger.error("Error analyzing item usage", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: { message: "Failed to analyze item usage" },
      });
    }
  }
);

// GET /api/characters/stats/skill-usage - Get skill usage statistics
router.get(
  "/stats/skill-usage",
  validateSeason,
  async (req: Request, res: Response) => {
    try {
      const {
        gameMode = "softcore",
        minLevel,
        maxLevel,
        classes,
        items,
        skills,
        season,
      } = req.query;

      const filter: Record<string, unknown> & {
        levelRange?: { min?: number; max?: number };
      } = {};

      if (minLevel || maxLevel) {
        filter.levelRange = {};
        if (minLevel) filter.levelRange.min = parseInt(minLevel as string, 10);
        if (maxLevel) filter.levelRange.max = parseInt(maxLevel as string, 10);
      }

      if (classes) {
        filter.requiredClasses = (classes as string).split(",");
      }

      if (items) {
        filter.requiredItems = (items as string)
          .split(",")
          .map((item) => item.trim());
      }

      if (skills) {
        try {
          const skillsData = JSON.parse(decodeURIComponent(skills as string));
          if (
            Array.isArray(skillsData) &&
            skillsData.every(
              (skill) =>
                typeof skill === "object" &&
                typeof skill.name === "string" &&
                typeof skill.minLevel === "number"
            )
          ) {
            filter.requiredSkills = skillsData;
          }
        } catch {
          // Invalid skills format, ignore
        }
      }

      if (season) {
        filter.season = parseInt(season as string, 10);
      } else {
        filter.season = config.currentSeason;
      }

      const skillUsage = await characterDB.analyzeSkillUsage(
        gameMode as string,
        filter
      );
      res.json(skillUsage);
    } catch (error: unknown) {
      logger.error("Error analyzing skill usage", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: { message: "Failed to analyze skill usage" },
      });
    }
  }
);

export default router;
