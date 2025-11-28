import { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Skeleton, Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@mantine/hooks";
import { Helmet } from "react-helmet";
import { charactersAPI } from "../api";
import {
  CharacterHeader,
  EquipmentSection,
  SkillsSection,
  StatsSection,
} from "../components/character";
import type { PlayerToggle, SkillsView } from "../types";

export default function Character() {
  const { name } = useParams<{ name: string }>();
  const characterName = name;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [playerToggle, setPlayerToggle] = useState<PlayerToggle>("player");
  const [skillsView, setSkillsView] = useState<SkillsView>("text");
  const [didError, setDidError] = useState(false);

  const charQuery = useQuery({
    queryKey: ["character", characterName],
    queryFn: async () => {
      try {
        const data = await charactersAPI.getCharacter(
          characterName || "",
          "softcore"
        );
        if (!data) {
          setDidError(true);
        }
        return data;
      } catch (error) {
        setDidError(true);
        throw error;
      }
    },
    retry: false,
    enabled: !!characterName,
  });

  return (
    <>
      <Helmet>
        <title>Builds - {characterName} - pd2.tools</title>
        <meta
          name="description"
          content={`View the build and complete stats of ${characterName} on Project Diablo 2`}
        />
      </Helmet>

      <Container my="md">
        {charQuery.isPending || didError ? (
          <Skeleton height="100vh">a</Skeleton>
        ) : (
          <Grid>
            <Grid.Col span={12}>
              <CharacterHeader
                characterName={charQuery.data.character.name}
                className={charQuery.data.character.class.name}
                level={charQuery.data.character.level}
                lastUpdated={charQuery.data?.lastUpdated}
                isMobile={isMobile}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 8 }}>
              <EquipmentSection
                playerItems={charQuery.data?.items}
                mercenary={charQuery.data?.mercenary}
                playerToggle={playerToggle}
                onPlayerToggleChange={setPlayerToggle}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <SkillsSection
                skills={charQuery.data.realSkills}
                hasCta={charQuery.data.hasCta}
                skillsView={skillsView}
                onSkillsViewChange={setSkillsView}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 12 }}>
              <StatsSection
                attributes={charQuery.data.character.attributes}
                stats={charQuery.data.character}
                realStats={charQuery.data.realStats}
              />
            </Grid.Col>
          </Grid>
        )}
      </Container>
    </>
  );
}
