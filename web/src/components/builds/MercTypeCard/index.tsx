import React, { useMemo } from "react";
import { Card, Flex, Text, Paper, ScrollArea, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { CharacterFilters } from "../../../hooks";
import type { MercTypeStats } from "../../../types";

// Map API descriptions to display names (Act + Aura)
const MERC_TYPE_DISPLAY: Record<string, string> = {
  // Act 1 Rogues
  "Fire Arrow": "A1 Vigor",
  "Cold Arrow": "A1 Meditation",
  "Physical Arrow": "A1 Slow Movement",

  // Act 2 Desert Guards
  "Defensive Auras": "A2 Defiance",
  "Offensive Auras": "A2 Blessed Aim",
  "Combat": "A2 Thorns",

  // Act 3 Iron Wolves
  "Fire Spells": "A3 Cleansing",
  "Cold Spells": "A3 Prayer",
  "Lightning Spells": "A3 Holy Shock",

  // Act 4 Ascendants
  "Dark": "A4 Amplify Damage",
  "Light": "A4 Sanctuary",

  // Act 5 Barbarians
  "Might Merc": "A5 Might",
  "Warcries": "A5 Battle Orders",
};

const getMercTypeDisplay = (rawType: string): string => {
  return MERC_TYPE_DISPLAY[rawType] || rawType;
};

interface Props {
  data: {
    mercTypeUsage: MercTypeStats[];
  };
  filters: Pick<CharacterFilters, "mercTypeFilter" | "searchQuery">;
  updateFilters: (filters: Partial<{ mercTypeFilter: string[] }>) => void;
}

export default function MercTypeCard({ data, filters, updateFilters }: Props) {
  const selectedMercTypesSet = useMemo(
    () => new Set(filters.mercTypeFilter),
    [filters.mercTypeFilter]
  );

  const handleMercTypeSelect = (mercType: string) => {
    const newMercTypeFilter = selectedMercTypesSet.has(mercType)
      ? filters.mercTypeFilter.filter((m) => m !== mercType)
      : [...filters.mercTypeFilter, mercType];
    updateFilters({ mercTypeFilter: newMercTypeFilter });
  };

  const filteredMercTypes = useMemo(() => {
    const searchQuery = filters.searchQuery?.toLowerCase() || "";

    return data.mercTypeUsage
      .filter((mercType) => {
        if (mercType.pct === 0) return false;
        if (searchQuery) {
          const displayName = getMercTypeDisplay(mercType.mercType).toLowerCase();
          const rawName = mercType.mercType.toLowerCase();
          if (!displayName.includes(searchQuery) && !rawName.includes(searchQuery))
            return false;
        }
        return true;
      })
      .map((mercType) => ({
        rawName: mercType.mercType,
        displayName: getMercTypeDisplay(mercType.mercType),
        percentage: mercType.pct,
        isSelected: selectedMercTypesSet.has(mercType.mercType),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [data.mercTypeUsage, filters.searchQuery, selectedMercTypesSet]);

  const hasMercTypes = filteredMercTypes.length > 0;

  return (
    <Card
      p={0}
      withBorder
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "425px",
        height: hasMercTypes ? undefined : "auto",
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ padding: "6px" }}>
        <Text fw={700}>MERC TYPE</Text>
      </div>

      {hasMercTypes ? (
        <ScrollArea style={{ flex: 1 }}>
          {filteredMercTypes.map(({ rawName, displayName, percentage, isSelected }) => (
            <Paper
              key={rawName}
              withBorder
              radius={0}
              p="5"
              style={{
                cursor: "pointer",
                borderLeft: "none",
                borderRight: "none",
                position: "relative",
                overflow: "hidden",
                backgroundColor: isSelected ? "rgba(0, 255, 0, 0.2)" : undefined,
              }}
              variant="hover"
              onClick={(e) => {
                const backgroundBar = e.currentTarget.querySelector(
                  'div[style*="position: absolute"]'
                ) as HTMLElement | null;
                if (backgroundBar) {
                  backgroundBar.style.width = "0%";
                }
                handleMercTypeSelect(rawName);
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${percentage}%`,
                  backgroundColor: isSelected
                    ? "rgba(0, 255, 0, 0.2)"
                    : "rgba(6, 182, 212, 0.35)",
                  zIndex: 0,
                }}
              />
              <Flex
                justify="space-between"
                align="center"
                style={{ position: "relative", zIndex: 1 }}
              >
                <Text>{displayName}</Text>
                {isSelected ? (
                  <ActionIcon
                    size="xs"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMercTypeSelect(rawName);
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                ) : (
                  <Text>{percentage.toFixed(1)}%</Text>
                )}
              </Flex>
            </Paper>
          ))}
        </ScrollArea>
      ) : (
        <></>
      )}
    </Card>
  );
}
