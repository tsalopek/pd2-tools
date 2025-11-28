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
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import type { CharacterFilters, SkillRequirement } from "../../../../hooks";
import type { SkillUsageStats } from "../../../../types";

interface Props {
  data: {
    skillUsage: SkillUsageStats[];
  };
  filters: Pick<CharacterFilters, "skillFilter" | "searchQuery">;
  updateFilters: (
    filters: Partial<{ skillFilter: SkillRequirement[] }>
  ) => void;
}

export default function SkillCard({ data, filters, updateFilters }: Props) {
  // Create memoized Set of selected skill names for O(1) lookup
  const selectedSkillsSet = useMemo(
    () => new Set(filters.skillFilter.map((s) => s.name)),
    [filters.skillFilter]
  );

  const handleSkillSelect = (skillName: string) => {
    const isCurrentlySelected = selectedSkillsSet.has(skillName);

    const newSkillFilter = isCurrentlySelected
      ? filters.skillFilter.filter((skill) => skill.name !== skillName)
      : [...filters.skillFilter, { name: skillName, minLevel: 20 }];

    updateFilters({ skillFilter: newSkillFilter });
  };

  const skillPercentages = useMemo(() => {
    if (!data.skillUsage) return [];
    const searchQuery = filters.searchQuery?.toLowerCase() || "";

    // Single pass transformation and filtering
    return data.skillUsage
      .reduce(
        (acc, skill) => {
          // Early return if it doesn't match search
          if (
            searchQuery &&
            !skill.name.toLowerCase().startsWith(searchQuery)
          ) {
            return acc;
          }

          acc.push({
            name: skill.name,
            percentage: skill.pct,
            isSelected: selectedSkillsSet.has(skill.name),
          });
          return acc;
        },
        [] as Array<{ name: string; percentage: number; isSelected: boolean }>
      )
      .sort(
        (a, b) =>
          b.percentage - a.percentage ||
          Number(b.isSelected) - Number(a.isSelected)
      );
  }, [data.skillUsage, filters.searchQuery, selectedSkillsSet]);

  const hasSkills = skillPercentages.length > 0;
  const needsScroll = skillPercentages.length > 8;

  const SkillItem = ({
    name,
    percentage,
    isSelected,
  }: {
    name: string;
    percentage: number;
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
        handleSkillSelect(name);
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
            : "rgba(33, 150, 243, 0.35)",
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
                handleSkillSelect(name);
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
        height: hasSkills ? undefined : "auto",
      }}
    >
      <div
        style={{
          margin: "6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text fw={700}>SKILLS</Text>
        <Tooltip
          multiline
          label="% of characters with 20 hard points in the skill"
        >
          <ActionIcon variant="subtle" color="gray">
            <IconInfoCircle size={16} />
          </ActionIcon>
        </Tooltip>
      </div>

      {hasSkills &&
        (needsScroll ? (
          <ScrollArea
            style={{ flex: 1 }}
            offsetScrollbars={"y"}
            scrollbarSize={8}
            type={"auto"}
            h={1000}
          >
            <div>
              {skillPercentages.map((skill) => (
                <SkillItem
                  key={skill.name}
                  name={skill.name}
                  percentage={skill.percentage}
                  isSelected={skill.isSelected}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div style={{ flex: 1 }}>
            {skillPercentages.map((skill) => (
              <SkillItem
                key={skill.name}
                name={skill.name}
                percentage={skill.percentage}
                isSelected={skill.isSelected}
              />
            ))}
          </div>
        ))}
    </Card>
  );
}
