import React, { useRef, useState } from "react";
import {
  Card,
  Select,
  Button,
  Flex,
  Text,
  SimpleGrid,
  TextInput,
  ActionIcon,
  Modal,
  RangeSlider,
  Tooltip,
} from "@mantine/core";
import { IconX, IconSettings, IconInfoCircle } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import type { BuildsComponentProps } from "../types";

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
  minLevel: number;
  maxLevel: number;
  onLevelChange: (min: number, max: number) => void;
}

function SettingsModal({
  opened,
  onClose,
  minLevel,
  maxLevel,
  onLevelChange,
}: SettingsModalProps) {
  const debouncedChange = useRef(
    debounce((value: [number, number]) => {
      onLevelChange(value[0], value[1]);
      Cookies.set(
        "levelRange",
        JSON.stringify({ min: value[0], max: value[1] }),
        { expires: 365 }
      );
    }, 500)
  ).current;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      size="sm"
      styles={{
        title: { fontWeight: 600 },
        body: { paddingTop: 5 },
        content: { minHeight: "200px" },
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <Text fw={700} size="sm" style={{ lineHeight: 1 }}>
            Character Level Range
          </Text>
          <Tooltip
            label="Inclusive level range (from-to) (default 94-99)"
            position="right"
          >
            <div
              style={{
                marginLeft: "5px",
                cursor: "help",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconInfoCircle size={16} />
            </div>
          </Tooltip>
        </div>
        <RangeSlider
          min={80}
          max={99}
          minRange={0}
          defaultValue={[minLevel, maxLevel]}
          onChangeEnd={debouncedChange}
          marks={[
            { value: 80, label: "80" },
            { value: 90, label: "90" },
            { value: 99, label: "99" },
          ]}
        />
      </div>
    </Modal>
  );
}

export default function ClassBar({
  data,
  filters,
  updateFilters,
}: BuildsComponentProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const handleGameModeChange = (value: string | null) => {
    if (value) {
      updateFilters({ gameMode: value.toLowerCase() });
    }
  };

  const handleSeasonChange = (value: string | null) => {
    if (value) {
      updateFilters({ season: parseInt(value) });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      updateFilters({ searchQuery: value });
    }, 300);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    updateFilters({ searchQuery: "" });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    updateFilters({
      classFilter: [],
      itemFilter: [],
      skillFilter: [],
      mercTypeFilter: [],
      mercItemFilter: [],
      searchQuery: "",
    });
  };

  return (
    <SimpleGrid cols={1} spacing="md">
      <Card withBorder w="100%" h="75px" py="xs" px="sm">
        <Flex
          gap="sm"
          justify="space-between"
          align="center"
          direction="row"
          h="100%"
        >
          <Flex direction="column" style={{ width: "33%" }}>
            <Text size="xs" fw={500} mb={4}>
              Season
            </Text>
            <Select
              placeholder="Select Season"
              data={[
                { value: "12", label: "Season 12" },
                { value: "11", label: "Season 11" },
              ]}
              value={filters.season.toString()}
              onChange={handleSeasonChange}
              style={{ width: "100%" }}
            />
          </Flex>

          <Flex direction="column" style={{ width: "33%" }}>
            <Text size="xs" fw={500} mb={4}>
              Game Mode
            </Text>
            <Select
              placeholder="Select Game Mode"
              data={[
                { value: "softcore", label: "Softcore" },
                { value: "hardcore", label: "Hardcore" },
              ]}
              value={filters.gameMode}
              onChange={handleGameModeChange}
              style={{ width: "100%" }}
            />
          </Flex>

          <Flex direction="column" style={{ width: "33%" }}>
            <Text size="xs" fw={500} mb={4}>
              Time Machine
            </Text>
            <Select
              placeholder="Select Snapshot"
              data={[{ value: "Latest Snapshot", label: "Latest Snapshot" }]}
              defaultValue="Latest Snapshot"
              style={{ width: "100%" }}
            />
          </Flex>
        </Flex>
      </Card>

      <div style={{ display: "flex", gap: "16px" }}>
        <Card withBorder style={{ width: "185px", height: "60px" }}>
          <Flex justify="center" align="center" h="100%">
            <TextInput
              placeholder="Search filters..."
              rightSection={
                searchInput ? (
                  <ActionIcon
                    variant="transparent"
                    color="gray"
                    onClick={handleSearchClear}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : null
              }
              value={searchInput}
              onChange={handleSearchChange}
              style={{ width: "100%" }}
            />
          </Flex>
        </Card>
        <Card withBorder style={{ flex: 1, height: "60px" }}>
          <Flex align="center" justify="space-between" h="100%">
            {isMobile ? null : (
              <Text>
                Found{" "}
                <Text span fw={700}>
                  {data.breakdown.total?.toLocaleString()}
                </Text>{" "}
                characters
              </Text>
            )}
            <Flex gap="md">
              <Button
                variant="outline"
                onClick={() => setSettingsOpened(true)}
                leftSection={<IconSettings size={16} />}
              >
                Settings
              </Button>
              <Button
                variant="outline"
                color="red"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </Button>
            </Flex>
          </Flex>
        </Card>
      </div>
      <SettingsModal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        minLevel={filters.minLevel}
        maxLevel={filters.maxLevel}
        onLevelChange={(min, max) =>
          updateFilters({ minLevel: min, maxLevel: max })
        }
      />
    </SimpleGrid>
  );
}
