import type { ReactNode } from "react";
import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

/**
 * Composed empty state: a soft brand-tinted icon, a title and a hint, plus an
 * optional action. Shares the visual language of {@link EstadoError} so loading,
 * error and empty results all feel like one system.
 */
export function EstadoVacio({
  icono: Icono,
  titulo,
  mensaje,
  children,
}: {
  icono: Icon;
  titulo: string;
  mensaje?: string;
  children?: ReactNode;
}) {
  return (
    <Center py={48}>
      <Stack align="center" gap="sm" maw={400}>
        <ThemeIcon size={56} radius="xl" variant="light" color="azulUrbano">
          <Icono size={28} stroke={1.6} />
        </ThemeIcon>
        <Text fw={600} fz="lg" ta="center">
          {titulo}
        </Text>
        {mensaje && (
          <Text c="dimmed" size="sm" ta="center">
            {mensaje}
          </Text>
        )}
        {children}
      </Stack>
    </Center>
  );
}
