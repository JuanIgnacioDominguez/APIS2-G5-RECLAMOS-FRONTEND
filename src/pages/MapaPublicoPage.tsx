import { useMemo, useState } from "react";
import { Card, Center, Group, Loader, Select, Stack, Text, Title } from "@mantine/core";

import { listarReclamos } from "@/api/reclamos";
import type { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";
import { opcionesCategoria, opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { EstadoError } from "@/components/EstadoError";
import { MapaReclamos } from "@/features/mapa/MapaReclamos";
import { reclamosUbicados } from "@/features/mapa/coords";

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
      <div>
        <Title order={2}>Mapa de reclamos</Title>
        <Text c="dimmed">Reclamos publicos reportados en la ciudad.</Text>
      </div>

      <Group>
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
        <Text size="sm" c="dimmed">
          {puntos.length} en el mapa
        </Text>
      </Group>

      {loading && (
        <Center py="xl">
          <Loader color="azulUrbano" />
        </Center>
      )}

      {error && <EstadoError mensaje={error} onReintentar={reload} />}

      {!loading && !error && (
        <Card withBorder radius="md" padding="xs">
          <MapaReclamos reclamos={puntos} />
        </Card>
      )}
    </Stack>
  );
}
