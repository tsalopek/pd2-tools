import React, { useMemo } from "react";
import {
  Card,
  Flex,
  Text,
  Paper,
  ScrollArea,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { CharacterFilters } from "../../../hooks";
import type { ItemUsageStats } from "../../../types";

interface Props {
  data: {
    mercItemUsage: ItemUsageStats[];
  };
  filters: Pick<CharacterFilters, "mercItemFilter" | "searchQuery">;
  updateFilters: (filters: Partial<{ mercItemFilter: string[] }>) => void;
}

export default function MercItemCard({ data, filters, updateFilters }: Props) {
  const selectedItemsSet = useMemo(
    () => new Set(filters.mercItemFilter),
    [filters.mercItemFilter]
  );

  const handleItemSelect = (itemName: string) => {
    const isSelected = selectedItemsSet.has(itemName);
    updateFilters({
      mercItemFilter: isSelected
        ? filters.mercItemFilter.filter((i) => i !== itemName)
        : [...filters.mercItemFilter, itemName],
    });
  };

  const itemPercentages = useMemo(() => {
    if (!data.mercItemUsage) return [];
    const searchQuery = filters.searchQuery?.toLowerCase() || "";

    return data.mercItemUsage
      .reduce(
        (acc, item) => {
          if (searchQuery && !item.item.toLowerCase().startsWith(searchQuery))
            return acc;

          acc.push({
            name: item.item,
            percentage: item.pct,
            type: item.itemType,
            isSelected: selectedItemsSet.has(item.item),
          });
          return acc;
        },
        [] as Array<{
          name: string;
          percentage: number;
          type: string;
          isSelected: boolean;
        }>
      )
      .sort(
        (a, b) =>
          b.percentage - a.percentage ||
          Number(b.isSelected) - Number(a.isSelected)
      );
  }, [data.mercItemUsage, filters.searchQuery, selectedItemsSet]);

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case "Unique":
        return "rgba(200, 110, 45, 0.35)";
      case "Set":
        return "rgba(21, 209, 30, 0.35)";
      case "Runeword":
        return "rgba(181, 184, 31, 0.35)";
      default:
        return "rgba(200, 200, 200, 0.1)";
    }
  };

  const hasItems = itemPercentages.length > 0;
  const needsScroll = itemPercentages.length > 8;

  const ItemRow = ({
    name,
    percentage,
    type,
    isSelected,
  }: {
    name: string;
    percentage: number;
    type: string;
    isSelected: boolean;
  }) => (
    <Paper
      key={name}
      withBorder
      radius={0}
      p="5"
      style={{
        cursor: "pointer",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
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
        handleItemSelect(name);
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
            : getItemTypeColor(type),
          zIndex: 0,
        }}
      />
      <Tooltip label={name} openDelay={500}>
        <Flex
          justify="space-between"
          align="center"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Text lineClamp={1}>{name}</Text>
          {isSelected ? (
            <ActionIcon
              size="xs"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                handleItemSelect(name);
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : (
            <Text>{percentage.toFixed(1)}%</Text>
          )}
        </Flex>
      </Tooltip>
    </Paper>
  );

  return (
    <Card
      p={0}
      withBorder
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "400px",
        height: hasItems ? undefined : "auto",
      }}
    >
      <div style={{ padding: "6px" }}>
        <Text fw={700}>MERC ITEMS</Text>
      </div>

      {hasItems &&
        (needsScroll ? (
          <ScrollArea
            style={{ flex: 1 }}
            offsetScrollbars={"y"}
            scrollbarSize={8}
            type={"auto"}
            h={1000}
          >
            <div>
              {itemPercentages.map((item) => (
                <ItemRow
                  key={item.name}
                  name={item.name}
                  percentage={item.percentage}
                  type={item.type}
                  isSelected={item.isSelected}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div style={{ flex: 1 }}>
            {itemPercentages.map((item) => (
              <ItemRow
                key={item.name}
                name={item.name}
                percentage={item.percentage}
                type={item.type}
                isSelected={item.isSelected}
              />
            ))}
          </div>
        ))}
    </Card>
  );
}
