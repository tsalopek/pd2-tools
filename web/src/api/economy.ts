import { apiClient } from "./client";
import { API_ENDPOINTS } from "../config/api";
import type {
  EconomyOverviewResponse,
  EconomyItemDetailResponse,
  ListingsCountResponse,
} from "../types";

export const economyAPI = {
  /**
   * Get economy overview (all items with summary stats)
   */
  async getItems(season?: number): Promise<EconomyOverviewResponse> {
    return apiClient.get<EconomyOverviewResponse>(API_ENDPOINTS.economyItems, {
      season,
    });
  },

  /**
   * Get detailed item economics with price history
   * TODO: Reimpliment economy
   * Currently returns items list as placeholder
   */
  async getItem(
    itemName: string,
    season?: number
  ): Promise<EconomyItemDetailResponse> {
    // Temporary: return items list
    // Backend needs /economy/items/:itemName endpoint with aggregated data
    return apiClient.get<EconomyItemDetailResponse>(
      API_ENDPOINTS.economyItems,
      {
        season,
      }
    );
  },

  /**
   * Get total listings count
   */
  async getListingsCount(season?: number): Promise<ListingsCountResponse> {
    return apiClient.get<ListingsCountResponse>(
      API_ENDPOINTS.economyListingsCount,
      {
        season,
      }
    );
  },
};
