import { useMemo, useState } from "react";
import { Badge, Card, Center, Group, Loader, Select, Stack, Text } from "@mantine/core";
import { IconMap2 } from "@tabler/icons-react";

import { listarReclamos } from "@/api/reclamos";
import { EstadoReclamo, type CategoriaReclamo } from "@/domain/enums";
import { ESTADO_COLOR, ESTADO_LABEL, opcionesCategoria, opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { EstadoError } from "@/components/EstadoError";
import { PageHeader } from "@/components/PageHeader";
import { MapaReclamos } from "@/features/mapa/MapaReclamos";
import { reclamosUbicados } from "@/features/mapa/coords";

/** States worth surfacing in the map legend, in lifecycle order. */
const ESTADOS_LEYENDA: EstadoReclamo[] = [
  EstadoReclamo.RECIBIDO,
  EstadoReclamo.EN_PROCESO,
  EstadoReclamo.RESUELTO,
  EstadoReclamo.RECHAZADO,
];

/**
 * Public map of geolocated claims (US-11), filterable by category and state.
 * Shows no personal data of the citizen who created each claim.
 */
export function MapaPublicoPage() {
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);

  const { data, loading, error, reload } = useAsync(() => listarReclamos({ size: 100 }), []);

  const puntos = useMemo(() => {
    const ubicados = reclamosUbicados(data?.items ?? []);
    return ubicados.filter(
      (r) =>
        (categoria === null || r.categoria === categoria) &&
        (estado === null || r.estado === estado),
    );
  }, [data, categoria, estado]);

  return (
    <Stack gap="lg">
      <PageHeader
        icono={IconMap2}
        titulo="Mapa de reclamos"
        descripcion="Reclamos publicos reportados en la ciudad, sin datos personales."
      />

      <Card withBorder radius="md" padding="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="sm" wrap="wrap">
            <Select
              w={200}
              placeholder="Todas las categorias"
              clearable
              data={opcionesCategoria()}
              value={categoria}
              onChange={(v) => setCategoria(v as CategoriaReclamo | null)}
              aria-label="Filtrar por categoria"
            />
            <Select
              w={200}
              placeholder="Todos los estados"
              clearable
              data={opcionesEstado()}
              value={estado}
              onChange={(v) => setEstado(v as EstadoReclamo | null)}
              aria-label="Filtrar por estado"
            />
          </Group>
          <Badge size="lg" variant="light" color="azulUrbano" radius="sm">
            {puntos.length} en el mapa
          </Badge>
        </Group>
      </Card>

      {loading && (
        <Center py={64}>
          <Loader color="azulUrbano" />
        </Center>
      )}

      {error && <EstadoError mensaje={error} onReintentar={reload} />}

      {!loading && !error && (
        <Card withBorder radius="md" padding="xs">
          <MapaReclamos reclamos={puntos} />
          <Group gap="lg" px="sm" py="xs" mt={4} wrap="wrap">
            {ESTADOS_LEYENDA.map((e) => (
              <Group key={e} gap={6} wrap="nowrap">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: `var(--mantine-color-${ESTADO_COLOR[e]}-6)`,
                  }}
                />
                <Text size="xs" c="dimmed">
                  {ESTADO_LABEL[e]}
                </Text>
              </Group>
            ))}
          </Group>
        </Card>
      )}
    </Stack>
  );
}
