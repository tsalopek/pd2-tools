import { Card, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import type { CharacterSnapshotListItem } from "../../types";
import {
  calculatePercentToNextLevel,
  formatExperience,
} from "../../utils/experience";

interface LevelProgressChartProps {
  snapshots: CharacterSnapshotListItem[];
  currentLevel: number;
  currentExperience: number;
  lastUpdated?: number;
}

export function LevelProgressChart({
  snapshots,
  currentLevel,
  currentExperience,
  lastUpdated,
}: LevelProgressChartProps) {
  // Prepare chart data: combine snapshots with current data
  const chartData = [
    // Historical snapshots (oldest to newest)
    ...snapshots
      .slice()
      .reverse() // Reverse to get oldest first
      .map((snapshot) => ({
        date: new Date(snapshot.snapshot_timestamp).toLocaleDateString(),
        timestamp: snapshot.snapshot_timestamp,
        fullTimestamp: new Date(snapshot.snapshot_timestamp).toLocaleString(),
        Level: snapshot.level,
        experience: snapshot.experience,
      })),
    // Add current level as the latest data point
    ...(lastUpdated
      ? [
          {
            date: new Date(lastUpdated).toLocaleDateString(),
            timestamp: lastUpdated,
            fullTimestamp: new Date(lastUpdated).toLocaleString(),
            Level: currentLevel,
            experience: currentExperience,
          },
        ]
      : []),
  ];

  // Remove duplicate dates (keep the latest level for each date)
  const uniqueData = chartData.reduce((acc, curr) => {
    const existingIndex = acc.findIndex((item) => item.date === curr.date);
    if (existingIndex !== -1) {
      // Keep the one with higher timestamp (more recent)
      if (curr.timestamp > acc[existingIndex].timestamp) {
        acc[existingIndex] = curr;
      }
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof chartData);

  // If only one data point, show a message instead of a chart
  if (uniqueData.length === 1) {
    return (
      <Card radius="md" shadow="md" padding="md" mt="md">
        <Card.Section
          style={{
            backgroundColor: "rgb(44, 45, 50)",
            borderBottom: "1.75px solid rgb(55, 58, 64)",
            padding: "8px 12px",
            marginBottom: "12px",
          }}
        >
          <Text fw={500}>Level History</Text>
        </Card.Section>
        <Text c="dimmed" size="sm" ta="center" py="xl">
          No historical data yet. Level progression will appear here as your
          character is updated over time.
        </Text>
      </Card>
    );
  }

  return (
    <Card radius="md" shadow="md" padding="md" mt="md">
      <Card.Section
        style={{
          backgroundColor: "rgb(44, 45, 50)",
          borderBottom: "1.75px solid rgb(55, 58, 64)",
          padding: "8px 12px",
          marginBottom: "12px",
        }}
      >
        <Text fw={500}>Level History</Text>
      </Card.Section>

      <LineChart
        h={300}
        data={uniqueData}
        dataKey="date"
        series={[{ name: "Level", color: "blue" }]}
        curveType="linear"
        connectNulls
        gridAxis="xy"
        withLegend={false}
        yAxisProps={{
          domain: [
            Math.max(1, Math.min(...uniqueData.map((d) => d.Level)) - 5),
            Math.min(99, Math.max(...uniqueData.map((d) => d.Level)) + 2),
          ],
        }}
        tooltipProps={{
          content: ({ label, payload }) => {
            if (!payload || payload.length === 0) return null;
            const data = payload[0].payload;
            const percent = calculatePercentToNextLevel(
              data.Level,
              data.experience
            );

            return (
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  padding: "12px",
                }}
              >
                <Text size="sm" fw={500} c="white">
                  {data.fullTimestamp || label}
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Level: {data.Level}
                  {data.Level === 99 && " (Max)"}
                </Text>
                <Text size="sm" c="dimmed">
                  Experience: {formatExperience(data.experience)}
                </Text>
                {percent !== null && (
                  <Text size="sm" c="blue" mt={4}>
                    Progress to {data.Level + 1}: {percent.toFixed(1)}%
                  </Text>
                )}
              </div>
            );
          },
        }}
      />
    </Card>
  );
}
