import { Button, Card, Image, Text, Title } from "@mantine/core";
import { IconExternalLink, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";
import RelativeTime from "@yaireo/relative-time";
import type { CharacterHeaderProps } from "../../types";

const relativeTime = new RelativeTime();

export function CharacterHeader({
  characterName,
  className,
  level,
  lastUpdated,
  isMobile,
  prevCharacter,
  nextCharacter,
}: CharacterHeaderProps) {
  const [searchParams] = useSearchParams();

  // Build URL params string (excluding nav) for back to search
  const getBackToSearchUrl = () => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "nav") params.set(key, value);
    });
    const queryString = params.toString();
    return queryString ? `/builds?${queryString}` : "/builds";
  };

  // Build character URL with same params for prev/next navigation
  const getCharacterUrl = (charName: string) => {
    const queryString = searchParams.toString();
    return queryString
      ? `/builds/character/${charName}?${queryString}`
      : `/builds/character/${charName}`;
  };

  const handleNavClick = (targetName: string) => {
    const navId = searchParams.get("nav");
    if (!navId) return;

    const ctx = sessionStorage.getItem(`characterNavContext_${navId}`);
    if (ctx) {
      const parsed = JSON.parse(ctx);
      const newIndex = parsed.list.indexOf(targetName);
      if (newIndex !== -1) {
        parsed.currentIndex = newIndex;
        sessionStorage.setItem(`characterNavContext_${navId}`, JSON.stringify(parsed));
      }
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <a href={getBackToSearchUrl()} style={{ textDecoration: "none" }}>
          <Button variant="default" size="sm">
            Back to search
          </Button>
        </a>

        <div style={{ display: "flex", gap: "8px", marginLeft: isMobile ? "0" : "16px" }}>
          <Button
            component="a"
            href={prevCharacter ? getCharacterUrl(prevCharacter) : undefined}
            onClick={() => prevCharacter && handleNavClick(prevCharacter)}
            variant="default"
            size="sm"
            disabled={!prevCharacter}
            leftSection={<IconChevronLeft size={16} />}
          >
            Previous
          </Button>

          <Button
            component="a"
            href={nextCharacter ? getCharacterUrl(nextCharacter) : undefined}
            onClick={() => nextCharacter && handleNavClick(nextCharacter)}
            variant="default"
            size="sm"
            disabled={!nextCharacter}
            rightSection={<IconChevronRight size={16} />}
          >
            Next
          </Button>
        </div>

        <a
          href={`https://projectdiablo2.com/character/${characterName}`}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none", marginLeft: "auto" }}
        >
          <Button
            variant="default"
            size="sm"
            rightSection={<IconExternalLink size={16} />}
          >
            Visit PD2 Armory
          </Button>
        </a>
      </div>

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
          )}
        </div>
      </Card>
    </>
  );
}
