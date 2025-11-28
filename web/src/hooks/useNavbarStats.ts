import { useState, useEffect } from "react";
import { statisticsAPI, charactersAPI } from "../api";
import type { NavbarStats } from "../types";

export function useNavbarStats() {
  const [stats, setStats] = useState<NavbarStats>({
    players: null,
    serverOnline: null,
    characters: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const [playersData, serverData, charData] = await Promise.allSettled([
          statisticsAPI.getOnlinePlayersLast(),
          statisticsAPI.healthCheck(),
          charactersAPI.getCharacterCounts(),
        ]);

        if (!mounted) return;

        let players: number | null = null;
        if (playersData.status === "fulfilled") {
          const data = playersData.value;
          if (
            Array.isArray(data) &&
            data.length > 0 &&
            typeof data[0].num_online_players === "number"
          ) {
            players = data[0].num_online_players;
          } else if (
            typeof data === "object" &&
            data !== null &&
            "num_online_players" in data &&
            typeof data.num_online_players === "number"
          ) {
            players = data.num_online_players;
          }
        }

        const serverOnline =
          serverData.status === "fulfilled" && serverData.value.status === "ok";

        let characters: number | null = null;
        if (charData.status === "fulfilled") {
          const counts = charData.value;
          if (
            typeof counts.hardcore === "number" &&
            typeof counts.softcore === "number"
          ) {
            characters = counts.hardcore + counts.softcore;
          }
        }

        setStats({ players, serverOnline, characters });
      } catch (error) {
        console.error("Failed to fetch navbar stats:", error);
        if (mounted) {
          setStats({ players: null, serverOnline: false, characters: null });
        }
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return stats;
}
