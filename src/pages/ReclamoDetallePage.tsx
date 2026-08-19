import {
  Alert,
  Anchor,
  Breadcrumbs,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { IconAlertTriangle, IconClockHour4 } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

import { obtenerReclamo } from "@/api/reclamos";
import { ESTADO_LABEL } from "@/domain/labels";
import { formatFecha, idCorto } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "@/features/reclamos/Badges";

export function ReclamoDetallePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: reclamo, loading, error } = useAsync(() => obtenerReclamo(id), [id]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="azulUrbano" />
      </Center>
    );
  }

  if (error || !reclamo) {
    return (
      <Alert
        color="rojoEmergencia"
        icon={<IconAlertTriangle size={16} />}
        title="No se pudo cargar"
      >
        {error ?? "Reclamo no encontrado"}
      </Alert>
    );
  }

  return (
    <Stack gap="lg" maw={900}>
      <Breadcrumbs>
        <Anchor onClick={() => navigate("/reclamos")}>Reclamos</Anchor>
        <Text ff="monospace">{idCorto(reclamo.id)}</Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{reclamo.titulo}</Title>
          <Text c="dimmed">{formatFecha(reclamo.created_at)}</Text>
        </div>
        <EstadoBadge estado={reclamo.estado} />
      </Group>

      <Group gap="xs">
        <CategoriaBadge categoria={reclamo.categoria} />
        <PrioridadBadge prioridad={reclamo.prioridad} />
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" padding="lg">
            <Title order={5} mb="sm">
              Descripcion
            </Title>
            <Text>{reclamo.descripcion}</Text>
            {reclamo.direccion && (
              <Text c="dimmed" mt="sm">
                {reclamo.direccion}
                {reclamo.barrio ? `, ${reclamo.barrio}` : ""}
              </Text>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" padding="lg">
            <Title order={5} mb="md">
              Trazabilidad
            </Title>
            <Timeline active={reclamo.historial.length} bulletSize={18} lineWidth={2}>
              {reclamo.historial.map((h) => (
                <Timeline.Item
                  key={h.id}
                  bullet={<IconClockHour4 size={12} />}
                  title={ESTADO_LABEL[h.estado_nuevo]}
                >
                  <Text size="xs" c="dimmed">
                    {formatFecha(h.created_at)}
                  </Text>
                  {h.motivo && <Text size="sm">{h.motivo}</Text>}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
