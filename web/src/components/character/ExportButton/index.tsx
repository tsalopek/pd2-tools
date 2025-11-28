import { Button, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { charactersAPI } from "../../../api";

export default function ExportButton({
  characterName,
}: {
  characterName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleExport() {
    setIsLoading(true);
    setError("");
    try {
      const base64Data = await charactersAPI.exportCharacter(characterName);
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data)) {
        throw new Error("Invalid Base64 data received");
      }
      // Convert Base64 to binary and trigger download
      const binaryString = atob(base64Data);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${characterName}.d2s`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export character");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "inline-block" }}>
      <Button
        variant="default"
        onClick={handleExport}
        size="xs"
        loading={isLoading}
        disabled={isLoading}
        style={{ marginLeft: "6px", marginTop: "12px" }}
      >
        {isLoading ? (
          "Exporting..."
        ) : (
          <>
            Export Save File
            <IconDownload
              style={{ marginLeft: "4px" }}
              height={16}
              width={16}
            />
          </>
        )}
      </Button>
      {error && (
        <Text size="xs" color="red" mt={2} style={{ marginLeft: 4 }}>
          {error}
        </Text>
      )}
    </div>
  );
}
