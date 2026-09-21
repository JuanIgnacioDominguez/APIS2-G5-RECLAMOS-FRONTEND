import { Button, Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconRefresh, IconWifiOff } from "@tabler/icons-react";

/**
 * Friendly error state with an explanation and a retry action, used wherever a
 * fetch can fail. Replaces the bare red alert with something recoverable.
 */
export function EstadoError({
  titulo = "No se pudo cargar",
  mensaje,
  onReintentar,
}: {
  titulo?: string;
  mensaje?: string | null;
  onReintentar?: () => void;
}) {
  return (
    <Center py={48}>
      <Stack align="center" gap="sm" maw={380}>
        <ThemeIcon size={56} radius="xl" variant="light" color="rojoEmergencia">
          <IconWifiOff size={28} />
        </ThemeIcon>
        <Text fw={600} fz="lg" ta="center">
          {titulo}
        </Text>
        <Text c="dimmed" size="sm" ta="center">
          {mensaje ?? "Revisa tu conexion o que el servicio este disponible e intenta de nuevo."}
        </Text>
        {onReintentar && (
          <Button
            variant="light"
            color="azulUrbano"
            leftSection={<IconRefresh size={16} />}
            onClick={onReintentar}
            mt="xs"
          >
            Reintentar
          </Button>
        )}
      </Stack>
    </Center>
  );
}
