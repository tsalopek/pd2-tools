import { ActionIcon, Card, Text, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import type { StatsSectionProps } from "../../types";

export function StatsSection({
  attributes,
  stats,
  realStats,
}: StatsSectionProps) {
  return (
    <Card h="665px" radius="md" shadow="md">
      <Card.Section style={{ marginBottom: "5px" }}>
        <Card
          radius="0"
          style={{
            backgroundColor: "rgb(44, 45, 50)",
            borderBottomColor: "rgb(55, 58, 64)",
            borderBottomWidth: "1.75px",
            borderBottomStyle: "solid",
          }}
        >
          <Card.Section>
            <Text fw={500} style={{ marginLeft: "10px", marginTop: "4.15px" }}>
              Stats
              <div
                style={{ float: "right", marginRight: "8px", marginTop: "2px" }}
              >
                <Tooltip
                  multiline
                  label={
                    <>
                      If you think one of the stats is wrong, please post the
                      character in #bug-report in discord
                    </>
                  }
                >
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconInfoCircle size={16} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </Text>
          </Card.Section>
        </Card>
      </Card.Section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          padding: "10px",
        }}
      >
        {/* Defensive Stats */}
        <div style={{ minWidth: "200px", flex: "1 1 0", order: 1 }}>
          <Text fw={700} style={{ marginTop: "0px" }}>
            Defensive
          </Text>
          <Text size="sm">
            Life:{" "}
            <span style={{ color: "rgb(239, 78, 78)" }}>{stats.life}</span>
          </Text>
          <Text size="sm">
            Mana:{" "}
            <span style={{ color: "rgb(36, 135, 235)" }}>{stats.mana}</span>
          </Text>
        </div>

        {/* Attributes */}
        <div style={{ minWidth: "200px", flex: "1 1 0", order: 2 }}>
          <Text fw={700} style={{ marginTop: "0px" }}>
            Attributes
            <Tooltip
              multiline
              label={<>Base Attribute / Actual Attribute (with gear)</>}
            >
              <IconInfoCircle size={12} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </Text>
          <Text size="sm">
            Strength:{" "}
            <span style={{ color: "rgb(239, 78, 78)" }}>
              {attributes.strength}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(239, 78, 78)" }}>
              {realStats.strength}
            </span>
          </Text>
          <Text size="sm">
            Dexterity:{" "}
            <span style={{ color: "rgb(49, 180, 56)" }}>
              {attributes.dexterity}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(49, 180, 56)" }}>
              {realStats.dexterity}
            </span>
          </Text>
          <Text size="sm">
            Vitality:{" "}
            <span style={{ color: "rgb(239, 78, 78)" }}>
              {attributes.vitality}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(239, 78, 78)" }}>
              {realStats.vitality}
            </span>
          </Text>
          <Text size="sm">
            Energy:{" "}
            <span style={{ color: "rgb(36, 135, 235)" }}>
              {attributes.energy}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(36, 135, 235)" }}>
              {realStats.energy}
            </span>
          </Text>
        </div>

        {/* Resistances */}
        <div style={{ minWidth: "200px", flex: "1 1 0", order: 3 }}>
          <Text fw={700} style={{ marginTop: "0px" }}>
            Resistances
            <Tooltip multiline label={<>Resist / Max Resist</>}>
              <IconInfoCircle size={12} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </Text>
          <Text size="sm">
            Fire:{" "}
            <span style={{ color: "rgb(148, 0, 0)" }}>{realStats.fireRes}</span>{" "}
            /{" "}
            <span style={{ color: "rgb(148, 0, 0)" }}>
              {realStats.maxFireRes}
            </span>
          </Text>
          <Text size="sm">
            Cold:{" "}
            <span style={{ color: "rgb(54, 99, 145)" }}>
              {realStats.coldRes}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(54, 99, 145)" }}>
              {realStats.maxColdRes}
            </span>
          </Text>
          <Text size="sm">
            Lightning:{" "}
            <span style={{ color: "rgb(255, 217, 0)" }}>
              {realStats.lightningRes}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(255, 217, 0)" }}>
              {realStats.maxLightningRes}
            </span>
          </Text>
          <Text size="sm">
            Poison:{" "}
            <span style={{ color: "#00991c" }}>{realStats.poisonRes}</span> /{" "}
            <span style={{ color: "#00991c" }}>{realStats.maxPoisonRes}</span>
          </Text>
        </div>

        {/* Absorb */}
        <div style={{ minWidth: "200px", flex: "1 1 0", order: 4 }}>
          <Text fw={700} style={{ marginTop: "0px" }}>
            Absorb
            <Tooltip multiline label={<>Flat Absorb / % Absorb</>}>
              <IconInfoCircle size={12} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </Text>
          <Text size="sm">
            Fire:{" "}
            <span style={{ color: "rgb(148, 0, 0)" }}>
              {realStats.fAbsorbFlat}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(148, 0, 0)" }}>
              {realStats.fAbsorbPct}%
            </span>
          </Text>
          <Text size="sm">
            Cold:{" "}
            <span style={{ color: "rgb(54, 99, 145)" }}>
              {realStats.cAbsorbFlat}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(54, 99, 145)" }}>
              {realStats.cAbsorbPct}%
            </span>
          </Text>
          <Text size="sm">
            Lightning:{" "}
            <span style={{ color: "rgb(255, 217, 0)" }}>
              {realStats.lAbsorbFlat}
            </span>{" "}
            /{" "}
            <span style={{ color: "rgb(255, 217, 0)" }}>
              {realStats.lAbsorbPct}%
            </span>
          </Text>
        </div>

        {/* Miscellaneous */}
        <div style={{ minWidth: "200px", flex: "1 1 0", order: 5 }}>
          <Text fw={700} style={{ marginTop: "0px" }}>
            Miscellaneous
          </Text>
          <Text size="sm">Faster Cast Rate: {realStats.fcr}%</Text>
          <Text size="sm">Faster Hit Recovery: {realStats.fhr}%</Text>
          <Text size="sm">Faster Run/Walk: {realStats.frw}%</Text>
          <Text size="sm">Gold Find: {realStats.gf}%</Text>
          <Text size="sm">Increased Attack Speed: {realStats.ias}%</Text>
          <Text size="sm">Magic Find: {realStats.mf}%</Text>
          <Text size="sm">Physical Damage Reduction: {realStats.pdr}%</Text>
        </div>
      </div>
    </Card>
  );
}
