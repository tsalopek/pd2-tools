import { Alert, Container, rem } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function EconomyDisclaimer() {
  return (
    <Container style={{ maxWidth: "75%" }}>
      {/*<Alert
      color="yellow"
      variant="light"
      icon={<IconAlertTriangle size="1rem" />}
      mb="md"
      mx={rem(20)}
      >
      Prices may be inaccurate, especially for items with a low amount of
      listings. Use your own discretion when determining item values. Only
      available for softcore.
      </Alert>*/}
      <Alert
        color="red"
        variant="light"
        icon={<IconAlertTriangle size="1rem" />}
        mb="md"
        mx={rem(20)}
      >
        Economy data won't be available until ~mid december when I get back from
        vacation, sorry. There are alternative spreadsheets with prices linked
        on the{" "}
        <a
          href="https://wiki.projectdiablo2.com/wiki/Links"
          target="_blank"
          rel="noopener noreferrer"
        >
          wiki
        </a>
        .
      </Alert>
    </Container>
  );
}
