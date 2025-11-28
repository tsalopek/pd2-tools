import { apiClient } from "./client";
import { API_ENDPOINTS, EXTERNAL_SERVICES } from "../config/api";
import type {
  FullCharacterResponse,
  CharacterFilter,
  CharacterListResponse,
  ItemUsageStats,
  SkillUsageStats,
  LevelDistribution,
  CharacterCounts,
} from "../types";

export const charactersAPI = {
  /**
   * Get filtered list of characters
   */
  async getCharacters(
    gameMode: string = "softcore",
    filter: CharacterFilter = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<CharacterListResponse> {
    return apiClient.get<CharacterListResponse>(API_ENDPOINTS.characters, {
      gameMode,
      page,
      pageSize,
      classes: filter.requiredClasses?.join(","),
      items: filter.requiredItems?.join(","),
      skills:
        filter.requiredSkills && filter.requiredSkills.length > 0
          ? encodeURIComponent(JSON.stringify(filter.requiredSkills))
          : undefined,
      minLevel: filter.levelRange?.min,
      maxLevel: filter.levelRange?.max,
      season: filter.season,
    });
  },

  /**
   * Get single character by name
   */
  async getCharacter(
    name: string,
    gameMode: string = "softcore",
    season?: number
  ): Promise<FullCharacterResponse | null> {
    return apiClient.get<FullCharacterResponse | null>(
      `${API_ENDPOINTS.character}/${name}`,
      {
        gameMode,
        season,
      }
    );
  },

  /**
   * Get item usage statistics
   */
  async getItemUsage(
    gameMode: string = "softcore",
    filter: CharacterFilter = {}
  ): Promise<ItemUsageStats[]> {
    return apiClient.get<ItemUsageStats[]>(API_ENDPOINTS.itemUsage, {
      gameMode,
      classes: filter.requiredClasses?.join(","),
      items: filter.requiredItems?.join(","),
      skills:
        filter.requiredSkills && filter.requiredSkills.length > 0
          ? encodeURIComponent(JSON.stringify(filter.requiredSkills))
          : undefined,
      minLevel: filter.levelRange?.min,
      maxLevel: filter.levelRange?.max,
      season: filter.season,
    });
  },

  /**
   * Get skill usage statistics
   */
  async getSkillUsage(
    gameMode: string = "softcore",
    filter: CharacterFilter = {}
  ): Promise<SkillUsageStats[]> {
    return apiClient.get<SkillUsageStats[]>(API_ENDPOINTS.skillUsage, {
      gameMode,
      classes: filter.requiredClasses?.join(","),
      items: filter.requiredItems?.join(","),
      skills:
        filter.requiredSkills && filter.requiredSkills.length > 0
          ? encodeURIComponent(JSON.stringify(filter.requiredSkills))
          : undefined,
      minLevel: filter.levelRange?.min,
      maxLevel: filter.levelRange?.max,
      season: filter.season,
    });
  },

  /**
   * Get level distribution
   */
  async getLevelDistribution(
    gameMode: string = "softcore",
    season?: number
  ): Promise<LevelDistribution[]> {
    return apiClient.get<LevelDistribution[]>(API_ENDPOINTS.levelDistribution, {
      gameMode,
      season,
    });
  },

  /**
   * Get character counts (HC/SC)
   */
  async getCharacterCounts(): Promise<CharacterCounts> {
    return apiClient.get<CharacterCounts>(API_ENDPOINTS.characterCounts);
  },

  /**
   * Export character data (from export api)
   */
  async exportCharacter(characterName: string): Promise<string> {
    const response = await fetch(
      `${EXTERNAL_SERVICES.characterExport}/data?username=${encodeURIComponent(characterName)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.text();
  },

  /**
   * Get export count (from export api)
   */
  async getExportCount(): Promise<{ count: number }> {
    const response = await fetch(
      `${EXTERNAL_SERVICES.characterExport}/export-count`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  },
};
