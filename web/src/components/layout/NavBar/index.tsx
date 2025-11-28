import { IconAlarm, IconChevronDown, IconDownload } from "@tabler/icons-react";
import {
  ActionIcon,
  Burger,
  Button,
  Drawer,
  Group,
  rem,
  Stack,
  Title,
  Tooltip,
  UnstyledButton,
  Menu,
  Box,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSearch.module.css";
import { useLocation } from "react-router-dom";
import { useNavbarStats, useTerrorZone } from "../../../hooks";

const links = [
  { link: "/builds", label: "Builds" },
  { link: "/economy/currency", label: "Economy" },
  {
    label: "Tools",
    subLinks: [
      {
        link: "/tools/character-export",
        label: (
          <span style={{ display: "flex", alignItems: "center" }}>
            <IconDownload
              style={{
                width: rem(16),
                height: rem(16),
                marginRight: rem(12),
              }}
            />
            Character Exporter
          </span>
        ),
      },
      {
        link: "/tools/corrupted-zone-tracker",
        label: (
          <span style={{ display: "flex", alignItems: "center" }}>
            <IconAlarm
              style={{
                width: rem(16),
                height: rem(16),
                marginRight: rem(12),
              }}
            />
            Corrupted Zones
          </span>
        ),
      },
    ],
  },
  { link: "/statistics", label: "Statistics" },
];

export function HeaderSearch() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation();

  const {
    players: playersCount,
    serverOnline: isServerOnline,
    characters: charactersCount,
  } = useNavbarStats();
  const { currentZoneDisplay, nextFiveZones } = useTerrorZone();

  const terrorZoneTooltipContent = (
    <Stack gap="xs">
      {nextFiveZones.length > 0 ? (
        nextFiveZones.map((zoneInfo, index) => (
          <Group
            key={`${zoneInfo.zone}-${index}`}
            justify="space-between"
            wrap="nowrap"
          >
            <Text
              size="xs"
              style={{
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {zoneInfo.zone}
            </Text>
            <Text size="xs" style={{ flexShrink: 0, marginLeft: rem(8) }}>
              {zoneInfo.minutesUntil}
            </Text>
          </Group>
        ))
      ) : (
        <Text size="xs">Loading next zones...</Text>
      )}
    </Stack>
  );

  const items = links.map((link) => {
    const isActive =
      location.pathname === link.link ||
      (link.subLinks &&
        link.subLinks.some((sl) => location.pathname === sl.link));

    if (link.subLinks) {
      return (
        <Menu
          key={link.label as string}
          shadow="md"
          width={200}
          trigger="hover"
          openDelay={0}
          closeDelay={100}
        >
          <Menu.Target>
            <span
              className={`${classes.link} ${isActive ? classes.active : ""}`}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {link.label}
              <IconChevronDown
                style={{ width: rem(15), height: rem(15), marginLeft: rem(5) }}
              />
            </span>
          </Menu.Target>
          <Menu.Dropdown>
            {link.subLinks.map((subLink) => {
              const isSubActive = location.pathname === subLink.link;
              const subLinkLabelKey =
                typeof subLink.label === "string"
                  ? subLink.label
                  : subLink.link;
              return (
                <Menu.Item
                  key={subLinkLabelKey}
                  component="a"
                  href={subLink.link}
                  className={isSubActive ? classes.activeDropdownItem : ""}
                >
                  {subLink.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label as string}
        href={link.link!}
        className={
          isActive ? `${classes.link} ${classes.active}` : classes.link
        }
      >
        {link.label}
      </a>
    );
  });

  const mobileItems = links.flatMap((link) => {
    const isActive =
      location.pathname === link.link ||
      (link.subLinks &&
        link.subLinks.some((sl) => location.pathname === sl.link));

    if (link.subLinks) {
      return [
        <UnstyledButton
          key={`mobile-${link.label as string}-header`}
          className={`${classes.mobileLink} ${classes.mobileDropdownHeader}`}
          style={{ fontWeight: "bold", color: "var(--mantine-color-dimmed)" }}
          onClick={(e) => e.preventDefault()}
        >
          {link.label}
        </UnstyledButton>,
        ...link.subLinks.map((subLink) => {
          const isSubActive = location.pathname === subLink.link;
          const subLinkLabelKey =
            typeof subLink.label === "string" ? subLink.label : subLink.link;
          return (
            <UnstyledButton
              key={`mobile-${subLinkLabelKey}`}
              component="a"
              href={subLink.link}
              className={
                isSubActive
                  ? `${classes.mobileLink} ${classes.activeMobileLink}`
                  : classes.mobileLink
              }
              style={{ paddingLeft: rem(20) }}
              onClick={close}
            >
              {subLink.label}
            </UnstyledButton>
          );
        }),
      ];
    }

    return (
      <UnstyledButton
        key={`mobile-${link.label as string}`}
        component="a"
        href={link.link!}
        className={
          isActive
            ? `${classes.mobileLink} ${classes.activeMobileLink}`
            : classes.mobileLink
        }
        onClick={close}
      >
        {link.label}
      </UnstyledButton>
    );
  });

  return (
    <>
      <Box
        visibleFrom="md"
        style={{
          backgroundColor: "#121212",
          color: "white",
          padding: `${rem(2)} ${rem(16)}`,
          height: "28px",
          display: "flex",
          alignItems: "center",
          borderBottom: `${rem(1)} solid #373A40`,
        }}
      >
        <Group
          justify="space-around"
          align="center"
          style={{ height: "100%", width: "100%" }}
        >
          <a
            href={"/statistics"}
            style={{ textDecoration: "none", color: "white" }}
          >
            <Group gap={0} align="center">
              <Text size="sm" c="white">
                Players in Game:{" "}
                <span style={{ fontWeight: 700 }}>
                  {playersCount !== null ? playersCount.toLocaleString() : "——"}
                </span>
              </Text>
              <span
                style={{
                  width: rem(8),
                  height: rem(8),
                  backgroundColor:
                    isServerOnline === null
                      ? "#adb5bd"
                      : isServerOnline
                        ? "#40C057"
                        : "#fa5252",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginLeft: rem(6),
                }}
              ></span>
            </Group>
          </a>

          <Group gap={0} align="center" style={{ marginLeft: rem(18) }}>
            <Text size="sm" c="white">
              Server:{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: isServerOnline === false ? "#fa5252" : "#40C057",
                }}
              >
                {isServerOnline === false ? "OFFLINE" : "ONLINE"}
              </span>
            </Text>
          </Group>

          <a
            href={"/tools/corrupted-zone-tracker"}
            style={{ textDecoration: "none", color: "white" }}
          >
            <Tooltip
              label={terrorZoneTooltipContent}
              withArrow
              position="bottom"
              transitionProps={{ transition: "pop", duration: 200 }}
              openDelay={200}
            >
              <Group gap={5} align="center" style={{ cursor: "default" }}>
                <Text size="sm" c="white">
                  Corrupted Zone:{" "}
                  <span style={{ fontWeight: 700, color: "#AE3EC9" }}>
                    {currentZoneDisplay.zone.length > 37
                      ? `${currentZoneDisplay.zone.slice(0, 37)}...`
                      : currentZoneDisplay.zone}
                  </span>{" "}
                  <span style={{ fontWeight: 400, color: "#A0A0A0" }}>
                    ({currentZoneDisplay.min})
                  </span>
                </Text>
              </Group>
            </Tooltip>
          </a>

          <Group gap={0} align="center">
            <Text size="sm" c="white">
              Characters Tracked:{" "}
              <span style={{ fontWeight: 700, color: "#FD7E14" }}>
                {charactersCount !== null
                  ? charactersCount.toLocaleString()
                  : "——"}
              </span>
            </Text>
          </Group>
        </Group>
      </Box>

      <header className={classes.header}>
        <div className={classes.inner}>
          <Group
            justify="space-between"
            style={{ width: "100%", position: "relative" }}
          >
            <Group>
              <a
                style={{ textDecoration: "none", color: "rgb(193, 194, 197)" }}
                key={"HomeTitle"}
                href={"/"}
              >
                <Title order={3}>pd2.tools</Title>
              </a>
            </Group>

            <Group
              gap={5}
              className={classes.links}
              visibleFrom="sm"
              justify="center"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {items}
            </Group>

            <Group gap={"xs"}>
              <a
                href="https://github.com/coleestrin/pd2-tools"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip label="GitHub">
                  <ActionIcon
                    variant="default"
                    style={{
                      backgroundColor: "#fff",
                      color: "#24292f",
                      borderColor: "#d0d7de",
                      width: "34px",
                      height: "34px",
                    }}
                    visibleFrom="sm"
                    radius={"md"}
                  >
                    <svg
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.582 0-.288-.012-1.243-.017-2.252-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.698.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </ActionIcon>
                </Tooltip>
              </a>
              <a
                href="https://discord.gg/invite/TVTExqWRhK"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip label="Discord">
                  <ActionIcon
                    variant="filled"
                    style={{
                      backgroundColor: "#5865F2",
                      color: "white",
                      width: "34px",
                      height: "34px",
                    }}
                    visibleFrom="sm"
                    radius={"md"}
                  >
                    <svg
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 256 199"
                    >
                      <path
                        fill="currentColor"
                        d="M216.856 16.597A208.5 208.5 0 00164.042 0c-2.275 4.113-4.933 9.646-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.807 207.807 0 00-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.13 161.13 0 0079.735 175.3a136.374 136.374 0 01-21.846-10.632 108.542 108.542 0 005.356-4.237c42.122 19.702 87.89 19.702 129.51 0 1.751 1.46 3.543 2.88 5.355 4.237a136.011 136.011 0 01-21.886 10.653c4.006 8.02 8.638 15.671 13.873 22.848 21.142-6.581 42.646-16.637 64.815-33.213 5.316-56.288-9.081-105.09-38.056-148.36zM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18z"
                      />
                    </svg>
                  </ActionIcon>
                </Tooltip>
              </a>
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                hiddenFrom="sm"
              />
            </Group>
          </Group>
        </div>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title={
          <Title order={4} c="dimmed" style={{ marginBottom: rem(10) }}>
            MENU
          </Title>
        }
        className={classes.drawer}
      >
        <Stack align="stretch" gap="sm" style={{ flexGrow: 1 }}>
          {mobileItems}
          <Button
            component="a"
            href="https://github.com/coleestrin/pd2-tools"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={
              <svg
                style={{
                  width: rem(18),
                  height: rem(18),
                  color: "#24292f",
                }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.582 0-.288-.012-1.243-.017-2.252-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.698.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            }
            variant="default"
            style={{
              backgroundColor: "#fff",
              color: "#24292f",
              borderColor: "#d0d7de",
              fontWeight: 600,
              marginTop: rem(10),
            }}
            onClick={close}
          >
            GitHub
          </Button>
          <Button
            component="a"
            href="https://discord.gg/invite/TVTExqWRhK"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={
              <svg
                style={{
                  width: rem(18),
                  height: rem(18),
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 256 199"
              >
                <path
                  fill="currentColor"
                  d="M216.856 16.597A208.5 208.5 0 00164.042 0c-2.275 4.113-4.933 9.646-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.807 207.807 0 00-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.13 161.13 0 0079.735 175.3a136.374 136.374 0 01-21.846-10.632 108.542 108.542 0 005.356-4.237c42.122 19.702 87.89 19.702 129.51 0 1.751 1.46 3.543 2.88 5.355 4.237a136.011 136.011 0 01-21.886 10.653c4.006 8.02 8.638 15.671 13.873 22.848 21.142-6.581 42.646-16.637 64.815-33.213 5.316-56.288-9.081-105.09-38.056-148.36zM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18z"
                />
              </svg>
            }
            variant="filled"
            style={{
              backgroundColor: "#5865F2",
              color: "white",
              marginTop: rem(10),
            }}
            onClick={close}
          >
            Discord
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
