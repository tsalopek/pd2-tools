import React, { useMemo } from "react";
import { Card, Flex, Text, Paper, ScrollArea, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { CharacterFilters } from "../../../hooks";
import type { MercTypeStats } from "../../../types";

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
        if (searchQuery && !mercType.mercType.toLowerCase().includes(searchQuery))
          return false;
        return true;
      })
      .map((mercType) => ({
        name: mercType.mercType,
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
        maxHeight: "400px",
        height: hasMercTypes ? undefined : "auto",
      }}
    >
      <div style={{ padding: "6px" }}>
        <Text fw={700}>MERC TYPE</Text>
      </div>

      {hasMercTypes ? (
        <ScrollArea style={{ flex: 1 }}>
          {filteredMercTypes.map(({ name, percentage, isSelected }) => (
            <Paper
              key={name}
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
                handleMercTypeSelect(name);
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${percentage}%`,
                  backgroundColor: "rgba(0, 255, 0, 0.2)",
                  zIndex: 0,
                }}
              />
              <Flex
                justify="space-between"
                align="center"
                style={{ position: "relative", zIndex: 1 }}
              >
                <Text>{name}</Text>
                {isSelected ? (
                  <ActionIcon
                    size="xs"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMercTypeSelect(name);
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
