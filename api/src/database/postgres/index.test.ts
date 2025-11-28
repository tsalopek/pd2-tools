//@ts-nocheck
import CharacterDB_Postgres from "./index";
import { CharacterFilter, FullCharacterResponse } from "./index";

process.env.POSTGRES_DB = "pd2_tools_test";
process.env.POSTGRES_USER = "test_user";
process.env.POSTGRES_PASSWORD = "test_password";
process.env.POSTGRES_HOST = "localhost";
process.env.POSTGRES_PORT = "5432";

// Sample test data
const sampleChar1_Sorc = {
  character: {
    name: "TestSorc1",
    level: 80,
    life: 1000,
    mana: 500,
    class: { id: 1, name: "Sorceress" },
    skills: [
      { id: 1, name: "Fire Ball", level: 20 },
      { id: 2, name: "Teleport", level: 15 },
    ],
  },
  items: [
    { name: "Shako", quality: { name: "Unique" } },
    {
      name: "Spirit Monarch",
      quality: { name: "Runeword" },
      runeword: true,
    },
    { name: "Sigon's Gage", quality: { name: "Set" } },
  ],
  realSkills: [],
  lastUpdated: 1678886400000,
};

const sampleChar2_Pala = {
  character: {
    name: "TestPala1",
    level: 90,
    life: 1200,
    mana: 600,
    class: { id: 4, name: "Paladin" },
    skills: [
      { id: 10, name: "Blessed Hammer", level: 20 },
      { id: 11, name: "Concentration", level: 20 },
    ],
  },
  items: [
    { name: "Shako", quality: { name: "Unique" } },
    {
      name: "Heart of the Oak",
      quality: { name: "Runeword" },
      runeword: true,
    },
  ],
  realSkills: [],
  lastUpdated: Date.now(),
};

const sampleChar3_Sorc = {
  character: {
    name: "TestSorc2",
    level: 70,
    life: 800,
    mana: 700,
    class: { id: 1, name: "Sorceress" },
    skills: [
      { id: 1, name: "Fire Ball", level: 18 },
      { id: 3, name: "Frozen Orb", level: 20 },
    ],
  },
  items: [],
  realSkills: [],
  lastUpdated: 1678886500000,
};

describe("CharacterDB_Postgres - Season Tracking", () => {
  let db: CharacterDB_Postgres;
  const gameModeSC = "softcore";
  const gameModeHC = "hardcore";
  const season11 = 11;
  const season12 = 12;

  beforeEach(async () => {
    db = new CharacterDB_Postgres();
    await db.ready;
    await db.clearGameModeData(gameModeSC, season11);
    await db.clearGameModeData(gameModeSC, season12);
    await db.clearGameModeData(gameModeHC, season11);
    await db.clearGameModeData(gameModeHC, season12);
  });

  afterAll(async () => {
    await db.close();
  });

  describe("Schema Initialization", () => {
    it("should create database connection", () => {
      expect(db).toBeInstanceOf(CharacterDB_Postgres);
    });

    it("should initialize schema correctly", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);
      const char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name,
        season11
      );
      expect(char).not.toBeNull();
    });
  });

  describe("Season Isolation", () => {
    it("should store characters in different seasons separately", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);
      await db.ingestCharacter(sampleChar2_Pala, gameModeSC, season12);

      const s11Chars = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      const s12Chars = await db.getFilteredCharacters(gameModeSC, {
        season: season12,
      });

      expect(s11Chars.total).toBe(1);
      expect(s12Chars.total).toBe(1);
      expect(s11Chars.characters[0]?.character?.name).toBe(
        sampleChar1_Sorc.character.name
      );
      expect(s12Chars.characters[0]?.character?.name).toBe(
        sampleChar2_Pala.character.name
      );
    });

    it("should allow same character name in different seasons", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);

      const sameCharDifferentSeason = {
        ...sampleChar1_Sorc,
        character: { ...sampleChar1_Sorc.character, level: 95 },
      };
      await db.ingestCharacter(sameCharDifferentSeason, gameModeSC, season12);

      const s11Char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name,
        season11
      );
      const s12Char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name,
        season12
      );

      expect(s11Char?.character!.level).toBe(80);
      expect(s12Char?.character!.level).toBe(95);
    });

    it("should clear only specified season data", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);
      await db.ingestCharacter(sampleChar2_Pala, gameModeSC, season12);

      await db.clearGameModeData(gameModeSC, season11);

      const s11Chars = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      const s12Chars = await db.getFilteredCharacters(gameModeSC, {
        season: season12,
      });

      expect(s11Chars.total).toBe(0);
      expect(s12Chars.total).toBe(1);
    });
  });

  describe("Character Ingestion", () => {
    it("should ingest character with all data", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);
      const char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name,
        season11
      );

      expect(char).not.toBeNull();
      expect(char?.character!.name).toBe(sampleChar1_Sorc.character.name);
      expect(char?.character!.level).toBe(sampleChar1_Sorc.character.level);
      expect(char?.character!.class.name).toBe(
        sampleChar1_Sorc.character.class.name
      );
      expect(char?.items?.length).toBe(sampleChar1_Sorc.items.length);
      expect(char?.character!.skills.length).toBe(
        sampleChar1_Sorc.character.skills.length
      );
    });

    it("should update existing character in same season", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);

      const updated = {
        ...sampleChar1_Sorc,
        character: { ...sampleChar1_Sorc.character, level: 85 },
      };
      await db.ingestCharacter(updated, gameModeSC, season11);

      const char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name,
        season11
      );
      expect(char?.character!.level).toBe(85);

      const { total } = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      expect(total).toBe(1);
    });

    it("should handle special characters in names", async () => {
      const specialChar = {
        ...sampleChar1_Sorc,
        character: {
          ...sampleChar1_Sorc.character,
          name: "Test'Name-With_Special#Chars",
        },
      };
      await db.ingestCharacter(specialChar, gameModeSC, season11);
      const char = await db.getCharacterByName(
        gameModeSC,
        specialChar.character.name,
        season11
      );
      expect(char?.character!.name).toBe(specialChar.character.name);
    });

    it("should not ingest if character or name is missing", async () => {
      const invalidChar = { ...sampleChar1_Sorc, character: null };
      await db.ingestCharacter(
        invalidChar as unknown as FullCharacterResponse,
        gameModeSC,
        season11
      );

      const { total } = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      expect(total).toBe(0);
    });

    it("should handle concurrent ingestion", async () => {
      await Promise.all([
        db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11),
        db.ingestCharacter(sampleChar2_Pala, gameModeSC, season11),
        db.ingestCharacter(sampleChar3_Sorc, gameModeSC, season11),
      ]);

      const { total } = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      expect(total).toBe(3);
    });
  });

  describe("Character Retrieval", () => {
    beforeEach(async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);
    });

    it("should retrieve character by name (case insensitive)", async () => {
      const charLower = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name.toLowerCase(),
        season11
      );
      expect(charLower).not.toBeNull();

      const charUpper = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name.toUpperCase(),
        season11
      );
      expect(charUpper).not.toBeNull();
    });

    it("should return null for non-existent character", async () => {
      const char = await db.getCharacterByName(
        gameModeSC,
        "NonExistentChar",
        season11
      );
      expect(char).toBeNull();
    });

    it("should return null for character in different season", async () => {
      const char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name,
        season12
      );
      expect(char).toBeNull();
    });

    it("should return latest season when no season specified", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season12);
      const char = await db.getCharacterByName(
        gameModeSC,
        sampleChar1_Sorc.character.name
      );
      expect(char).not.toBeNull();
    });
  });

  describe("Character Filtering", () => {
    beforeEach(async () => {
      await Promise.all([
        db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11),
        db.ingestCharacter(sampleChar2_Pala, gameModeSC, season11),
        db.ingestCharacter(sampleChar3_Sorc, gameModeSC, season11),
      ]);
    });

    it("should filter by class", async () => {
      const filter: CharacterFilter = {
        requiredClasses: ["Sorceress"],
        season: season11,
      };
      const { total, characters } = await db.getFilteredCharacters(
        gameModeSC,
        filter
      );
      expect(total).toBe(2);
      characters.forEach((char) => {
        expect(char.character!.class.name).toBe("Sorceress");
      });
    });

    it("should filter by required item", async () => {
      const filter: CharacterFilter = {
        requiredItems: ["Shako"],
        season: season11,
      };
      const { total } = await db.getFilteredCharacters(gameModeSC, filter);
      expect(total).toBe(2);
    });

    it("should filter by multiple required items (AND logic)", async () => {
      const filter: CharacterFilter = {
        requiredItems: ["Shako", "Spirit Monarch"],
        season: season11,
      };
      const { total, characters } = await db.getFilteredCharacters(
        gameModeSC,
        filter
      );
      expect(total).toBe(1);
      expect(characters[0].character!.name).toBe(
        sampleChar1_Sorc.character.name
      );
    });

    it("should filter by required skill and level", async () => {
      const filter: CharacterFilter = {
        requiredSkills: [{ name: "Fire Ball", minLevel: 20 }],
        season: season11,
      };
      const { total, characters } = await db.getFilteredCharacters(
        gameModeSC,
        filter
      );
      expect(total).toBe(1);
      expect(characters[0].character!.name).toBe(
        sampleChar1_Sorc.character.name
      );
    });

    it("should filter by level range", async () => {
      const filter: CharacterFilter = {
        levelRange: { min: 85, max: 95 },
        season: season11,
      };
      const { total, characters } = await db.getFilteredCharacters(
        gameModeSC,
        filter
      );
      expect(total).toBe(1);
      expect(characters[0].character!.name).toBe(
        sampleChar2_Pala.character.name
      );
    });

    it("should combine multiple filters", async () => {
      const filter: CharacterFilter = {
        requiredClasses: ["Sorceress"],
        requiredItems: ["Shako"],
        requiredSkills: [{ name: "Fire Ball", minLevel: 20 }],
        season: season11,
      };
      const { total, characters } = await db.getFilteredCharacters(
        gameModeSC,
        filter
      );
      expect(total).toBe(1);
      expect(characters[0].character!.name).toBe(
        sampleChar1_Sorc.character.name
      );
    });

    it("should return empty for no matches", async () => {
      const filter: CharacterFilter = {
        requiredClasses: ["Amazon"],
        season: season11,
      };
      const { total, characters, breakdown } = await db.getFilteredCharacters(
        gameModeSC,
        filter
      );
      expect(total).toBe(0);
      expect(characters.length).toBe(0);
      expect(breakdown.total).toBe(0);
    });

    it("should support pagination", async () => {
      const page1 = await db.getFilteredCharacters(
        gameModeSC,
        { season: season11 },
        1,
        2
      );
      expect(page1.characters.length).toBe(2);
      expect(page1.total).toBe(3);

      const page2 = await db.getFilteredCharacters(
        gameModeSC,
        { season: season11 },
        2,
        2
      );
      expect(page2.characters.length).toBe(1);
      expect(page2.total).toBe(3);
    });

    it("should return breakdown by class", async () => {
      const { breakdown } = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      expect(breakdown.Sorceress).toBe(2);
      expect(breakdown.Paladin).toBe(1);
      expect(breakdown.total).toBe(3);
    });
  });

  describe("Level Distribution", () => {
    it("should return level distribution for specific season", async () => {
      const chars = Array.from({ length: 5 }, (_, i) => ({
        ...sampleChar1_Sorc,
        character: {
          ...sampleChar1_Sorc.character,
          name: `Char${i}`,
          level: 80 + i,
        },
      }));

      await Promise.all(
        chars.map((char) => db.ingestCharacter(char, gameModeSC, season11))
      );

      const dist = await db.getLevelDistributions(season11);
      expect(dist.softcore).toBeDefined();
      expect(dist.hardcore).toBeDefined();
    });

    it("should return empty distribution for season with no data", async () => {
      const dist = await db.getLevelDistributions(season12);
      expect(dist.softcore.every((d) => d.count === 0)).toBe(true);
      expect(dist.hardcore.every((d) => d.count === 0)).toBe(true);
    });
  });

  describe("Item Usage Analytics", () => {
    beforeEach(async () => {
      await Promise.all([
        db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11),
        db.ingestCharacter(sampleChar2_Pala, gameModeSC, season11),
      ]);
    });

    it("should analyze item usage for specific season", async () => {
      const usage = await db.analyzeItemUsage(gameModeSC, {
        season: season11,
      });
      const shako = usage.find((item) => item.item === "Shako");
      expect(shako).toBeDefined();
      expect(shako!.numOccurrences).toBe(2);
      expect(shako!.totalSample).toBe(2);
      expect(shako!.pct).toBe(100);
    });

    it("should filter item usage by class", async () => {
      const usage = await db.analyzeItemUsage(gameModeSC, {
        requiredClasses: ["Sorceress"],
        season: season11,
      });
      const shako = usage.find((item) => item.item === "Shako");
      expect(shako!.numOccurrences).toBe(1);
      expect(shako!.totalSample).toBe(1);
    });

    it("should return empty for season with no data", async () => {
      const usage = await db.analyzeItemUsage(gameModeSC, {
        season: season12,
      });
      expect(usage.length).toBe(0);
    });
  });

  describe("Skill Usage Analytics", () => {
    beforeEach(async () => {
      await Promise.all([
        db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11),
        db.ingestCharacter(sampleChar2_Pala, gameModeSC, season11),
      ]);
    });

    it("should analyze skill usage for specific season", async () => {
      const usage = await db.analyzeSkillUsage(gameModeSC, {
        season: season11,
      });
      const fireball = usage.find((skill) => skill.name === "Fire Ball");
      expect(fireball).toBeDefined();
    });

    it("should only count skills at level 20+", async () => {
      const usage = await db.analyzeSkillUsage(gameModeSC, {
        season: season11,
      });
      const teleport = usage.find((skill) => skill.name === "Teleport");
      expect(teleport).toBeUndefined(); // Teleport is level 15
    });

    it("should return empty for season with no data", async () => {
      const usage = await db.analyzeSkillUsage(gameModeSC, {
        season: season12,
      });
      expect(usage.length).toBe(0);
    });
  });

  describe("Online Players History", () => {
    it("should log and retrieve online player counts", async () => {
      await db.logOnlinePlayers(100);
      await db.logOnlinePlayers(150);

      const history = await db.getOnlinePlayersHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[history.length - 2].num_online_players).toBe(100);
      expect(history[history.length - 1].num_online_players).toBe(150);
    });
  });

  describe("Game Mode Isolation", () => {
    it("should isolate softcore and hardcore data", async () => {
      await db.ingestCharacter(sampleChar1_Sorc, gameModeSC, season11);
      await db.ingestCharacter(sampleChar2_Pala, gameModeHC, season11);

      const scChars = await db.getFilteredCharacters(gameModeSC, {
        season: season11,
      });
      const hcChars = await db.getFilteredCharacters(gameModeHC, {
        season: season11,
      });

      expect(scChars.total).toBe(1);
      expect(hcChars.total).toBe(1);
    });
  });
});
