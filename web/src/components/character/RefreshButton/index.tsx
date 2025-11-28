import { Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { charactersAPI } from "../../../api";

// Unused, need to reimplement

export default function RefreshButton({
  characterName,
}: {
  characterName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  async function handleRefresh() {
    setIsLoading(true);

    try {
      await charactersAPI.refreshCharacter(characterName);
      await queryClient.invalidateQueries({
        queryKey: ["character", characterName],
      });
    } catch (error) {
      console.error("Failed to refresh character:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="default"
      onClick={handleRefresh}
      size="xs"
      loading={isLoading}
      disabled={isLoading}
      style={{ marginLeft: "6px", marginTop: "12px" }}
    >
      {isLoading ? (
        "Updating..."
      ) : (
        <>
          Update
          <IconRefresh style={{ marginLeft: "4px" }} height={16} width={16} />
        </>
      )}
    </Button>
  );
}
