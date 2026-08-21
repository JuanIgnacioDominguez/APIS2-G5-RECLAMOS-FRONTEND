import { useState } from "react";
import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
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
import { IconAlertTriangle, IconClockHour4, IconMapPin, IconUsers } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";

import { adherir, obtenerReclamo } from "@/api/reclamos";
import { ESTADO_LABEL } from "@/domain/labels";
import { formatFecha, idCorto } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "@/features/reclamos/Badges";

function DatoFila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xl">
      <Text size="sm" c="dimmed">
        {etiqueta}
      </Text>
      <Text size="sm" fw={500} ta="right">
        {valor}
      </Text>
    </Group>
  );
}

export function ReclamoDetallePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: reclamo, loading, error } = useAsync(() => obtenerReclamo(id), [id]);
  const [adhiriendo, setAdhiriendo] = useState(false);
  const [adhesiones, setAdhesiones] = useState<number | null>(null);

  async function handleAdherir() {
    setAdhiriendo(true);
    try {
      const res = await adherir(id);
      setAdhesiones(res.adhesiones_count);
      notifications.show({
        color: "verdeUrbano",
        title: "Adhesion registrada",
        message: "Gracias por sumarte a este reclamo.",
      });
    } catch (err) {
      notifications.show({
        color: "rojoEmergencia",
        title: "No se pudo adherir",
        message: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setAdhiriendo(false);
    }
  }

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

  const totalAdhesiones = adhesiones ?? reclamo.adhesiones_count;

  return (
    <Stack gap="lg" maw={980}>
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
          <Stack gap="lg">
            <Card withBorder radius="md" padding="lg">
              <Title order={5} mb="sm">
                Descripcion
              </Title>
              <Text>{reclamo.descripcion}</Text>
              {reclamo.direccion && (
                <Group gap={6} mt="md" c="dimmed">
                  <IconMapPin size={16} />
                  <Text size="sm">
                    {reclamo.direccion}
                    {reclamo.barrio ? `, ${reclamo.barrio}` : ""}
                  </Text>
                </Group>
              )}
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Group justify="space-between">
                <Group gap={8}>
                  <IconUsers size={18} />
                  <Text fw={500}>
                    {totalAdhesiones}{" "}
                    {totalAdhesiones === 1 ? "vecino adherido" : "vecinos adheridos"}
                  </Text>
                </Group>
                <Button
                  variant="light"
                  color="azulUrbano"
                  loading={adhiriendo}
                  onClick={handleAdherir}
                  leftSection={<IconUsers size={16} />}
                >
                  A mi tambien me pasa
                </Button>
              </Group>
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="lg">
            <Card withBorder radius="md" padding="lg">
              <Title order={5} mb="md">
                Detalles
              </Title>
              <Stack gap="xs">
                <DatoFila etiqueta="Categoria" valor={reclamo.categoria} />
                <DatoFila etiqueta="Prioridad" valor={reclamo.prioridad} />
                <DatoFila etiqueta="Estado" valor={ESTADO_LABEL[reclamo.estado]} />
                <DatoFila etiqueta="Barrio" valor={reclamo.barrio ?? "-"} />
                {reclamo.asignado_a && (
                  <DatoFila etiqueta="Asignado a" valor={reclamo.asignado_a} />
                )}
              </Stack>
            </Card>

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
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
