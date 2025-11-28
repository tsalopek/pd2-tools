import NodeCache from "node-cache";
import { logger as mainLogger } from "../config";

const logger = mainLogger.createNamedLogger("Cache");

// Cache with 15 minute TTL
const cache = new NodeCache({
  stdTTL: 900, // 15 minutes in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects for better performance
});

// Log cache statistics periodically
cache.on("set", (key) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on("expired", (key) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

/**
 * Get a value from cache
 */
export function getCacheValue<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

/**
 * Set a value in cache
 */
export function setCacheValue<T>(key: string, value: T, ttl?: number): boolean {
  return cache.set(key, value, ttl || 900);
}

/**
 * Delete a value from cache
 */
export function deleteCacheValue(key: string): number {
  return cache.del(key);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.flushAll();
  logger.info("Cache cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}

export default cache;
