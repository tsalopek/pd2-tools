import { useEffect, useState } from 'react';
import { Box, Group, Text, Anchor, CloseButton, Title } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

const PAGEVIEW_KEY = 'pd2tools_pageviews';
const DISMISSED_KEY = 'pd2tools_banner_dismissed';
const PAGEVIEW_THRESHOLD = 10;

export function SupportBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const isDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
    if (isDismissed) {
      return;
    }

    // Increment pageview count
    const currentViews = parseInt(localStorage.getItem(PAGEVIEW_KEY) || '0', 10);
    const newViews = currentViews + 1;
    localStorage.setItem(PAGEVIEW_KEY, newViews.toString());

    // Show banner if threshold met
    if (newViews >= PAGEVIEW_THRESHOLD) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Box
      bg="yellow.5"
      c="black"
      py="sm"
      px="md"
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
          <IconStar
            size={24}
            fill="black"
            color="black"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <Box>
            <Title order={6} mb={4}>
              Enjoying pd2.tools?
            </Title>
            <Text size="sm">
              If you wanted to show your support, starring the{' '}
              <Anchor
                href="https://github.com/coleestrin/pd2-tools"
                target="_blank"
                rel="noopener noreferrer"
                c="blue.8"
                underline="always"
                fw={600}
              >
                pd2.tools GitHub repository
              </Anchor>
	      {' '}would really help us out!
            </Text>
          </Box>
        </Group>
        <CloseButton
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          variant="transparent"
          c="black"
          size="lg"
        />
      </Group>
    </Box>
  );
}
