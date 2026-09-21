import {
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconChartBar, IconClockHour4, IconInbox } from "@tabler/icons-react";

import { EstadoError } from "@/components/EstadoError";
import { PageHeader } from "@/components/PageHeader";

import { estadisticas } from "@/api/reclamos";
import type { ConteoPorClave } from "@/api/types";
import { useAsync } from "@/hooks/useAsync";

function Distribucion({ titulo, datos }: { titulo: string; datos: ConteoPorClave[] }) {
  const total = datos.reduce((acc, d) => acc + d.cantidad, 0) || 1;
  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={5} mb="md">
        {titulo}
      </Title>
      <Stack gap="sm">
        {datos.length === 0 && <Text c="dimmed">Sin datos.</Text>}
        {datos.map((d) => (
          <div key={d.clave}>
            <Group justify="space-between" mb={4}>
              <Text size="sm">{d.clave}</Text>
              <Text size="sm" fw={600}>
                {d.cantidad}
              </Text>
            </Group>
            <Progress value={(d.cantidad / total) * 100} color="azulUrbano" size="sm" />
          </div>
        ))}
      </Stack>
    </Card>
  );
}

/**
 * Admin-only metrics panel. Feeds off the module's `GET /reclamos/estadisticas`
 * (the same endpoint that serves Group 8's Urban Analytics).
 */
export function PanelPage() {
  const { data, loading, error, reload } = useAsync(() => estadisticas(), []);

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="azulUrbano" />
      </Center>
    );
  }

  if (error || !data) {
    return <EstadoError mensaje={error ?? "Sin datos"} onReintentar={reload} />;
  }

  const horas = data.tiempo_resolucion_horas_promedio;

  return (
    <Stack gap="lg">
      <PageHeader
        icono={IconChartBar}
        titulo="Panel de metricas"
        descripcion="Resumen del modulo de reclamos."
      />

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.3}>
                  Total de reclamos
                </Text>
                <Text fz={34} fw={700} mt={4}>
                  {data.total}
                </Text>
              </div>
              <ThemeIcon size={46} radius="md" variant="light" color="azulUrbano">
                <IconInbox size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.3}>
                  Tiempo de resolucion promedio
                </Text>
                <Text fz={34} fw={700} mt={4}>
                  {horas === null ? "-" : `${horas.toFixed(1)} h`}
                </Text>
              </div>
              <ThemeIcon size={46} radius="md" variant="light" color="verdeUrbano">
                <IconClockHour4 size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Distribucion titulo="Por estado" datos={data.por_estado} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Distribucion titulo="Por categoria" datos={data.por_categoria} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Distribucion titulo="Por prioridad" datos={data.por_prioridad} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
