import { Button, Card, Center, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowRight, IconPlugConnected } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

import { GRUPO_NOMBRE, navItemPorRuta } from "@/config/navigation";

/**
 * Stand-in for the CityPass+ sections owned by other groups. Reclamos is the
 * only module this frontend implements; the rest will be wired over HTTPS as
 * each group exposes its API, so we show a clear "coming from Grupo X" state
 * instead of a dead link.
 */
export function SectionPlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = navItemPorRuta(location.pathname);

  const nombre = item?.label ?? "Seccion";
  const Icono = item?.icon ?? IconPlugConnected;
  const duenio = item && item.ownerGroup !== null ? GRUPO_NOMBRE[item.ownerGroup] : "otro modulo";

  return (
    <Center mih="70vh">
      <Card withBorder radius="lg" padding="xl" maw={520}>
        <Stack align="center" gap="md">
          <ThemeIcon size={64} radius="xl" variant="light" color="azulUrbano">
            <Icono size={34} />
          </ThemeIcon>
          <Title order={2} ta="center">
            {nombre}
          </Title>
          <Text c="dimmed" ta="center">
            Esta seccion la desarrolla {duenio}. Se integrara por HTTPS cuando ese modulo publique
            su API. Por ahora, el unico modulo de este frontend es <b>Reclamos</b>.
          </Text>
          <Button
            variant="light"
            color="azulUrbano"
            rightSection={<IconArrowRight size={16} />}
            onClick={() => navigate("/reclamos")}
          >
            Ir a Reclamos
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
