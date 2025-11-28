import { Button, Card, Image, Text, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import RelativeTime from "@yaireo/relative-time";
import ExportButton from "./ExportButton";
import type { CharacterHeaderProps } from "../../types";

const relativeTime = new RelativeTime();

export function CharacterHeader({
  characterName,
  className,
  level,
  lastUpdated,
  isMobile,
}: CharacterHeaderProps) {
  return (
    <>
      <a
        href="/builds"
        style={{ textDecoration: "none", display: "inline-block" }}
        onClick={(e) => {
          const referrer = document.referrer;
          const isInternalBuilds =
            referrer && referrer.includes(window.location.origin + "/builds");
          if (isInternalBuilds) {
            e.preventDefault();
            window.history.back();
          }
        }}
      >
        <Button variant="default" size="sm" style={{ marginBottom: "10px" }}>
          Back to search
        </Button>
      </a>

      <a
        href={`https://projectdiablo2.com/character/${characterName}`}
        target="_blank"
        rel="noreferrer"
      >
        <Button
          variant="default"
          size="sm"
          style={{ marginBottom: "10px", float: "right" }}
        >
          Visit PD2 Armory<span style={{ marginLeft: "4px" }}></span>
          <IconExternalLink
            width={16}
            height={16}
            style={{ marginTop: "2px" }}
          />
        </Button>
      </a>

      <Card h="100px" w="100%" radius="md" shadow="md" p="md">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image src={`/${className}.webp`} width={64} height={64} />
            <div style={{ marginLeft: "16px" }}>
              <Title order={1}>{characterName}</Title>
              <Text size="md">
                Level {level} {className}
              </Text>
            </div>
          </div>
          {!isMobile && (
            <>
              <ExportButton characterName={characterName} />
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  textAlign: "right",
                  marginBottom: "4px",
                  marginRight: "6px",
                }}
              >
                <Text size="xs">
                  Last updated:{" "}
                  {lastUpdated
                    ? relativeTime.from(new Date(lastUpdated))
                    : "Unknown"}
                </Text>
              </div>
            </>
          )}
        </div>
      </Card>
    </>
  );
}
