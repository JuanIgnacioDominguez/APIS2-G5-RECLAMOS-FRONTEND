import type { ReactNode } from "react";
import { Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

/**
 * Consistent page heading: an optional identity icon, the title in the display
 * face, a dimmed one-line description, and a right-aligned slot for the page's
 * primary action. Keeps every screen's top on the same rhythm.
 */
export function PageHeader({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: {
  icono?: Icon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
      <Group gap="md" wrap="nowrap" align="center">
        {Icono && (
          <ThemeIcon size={44} radius="md" variant="light" color="azulUrbano" visibleFrom="xs">
            <Icono size={24} stroke={1.6} />
          </ThemeIcon>
        )}
        <Stack gap={2}>
          <Title order={2}>{titulo}</Title>
          {descripcion && (
            <Text c="dimmed" size="sm">
              {descripcion}
            </Text>
          )}
        </Stack>
      </Group>
      {accion}
    </Group>
  );
}
