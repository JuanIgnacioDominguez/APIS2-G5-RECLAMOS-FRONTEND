import { useMemo, useState } from "react";
import { Badge, Card, Center, Grid, Group, Loader, Select, Stack } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";

import { listarReclamos } from "@/api/reclamos";
import type { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";
import { opcionesCategoria, opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { EstadoError } from "@/components/EstadoError";
import { EstadoVacio } from "@/components/EstadoVacio";
import { PageHeader } from "@/components/PageHeader";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";
import { barriosDisponibles, filtrarFeed } from "@/features/reclamos/feed";

/**
 * Public feed of the city's latest claims (US-06), filterable by category,
 * neighbourhood and status (US-07). Reads the shared `GET /reclamos` list and
 * ranks it newest first; every card links to the claim's detail.
 */
export function FeedPublicoPage() {
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [barrio, setBarrio] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);

  const { data, loading, error, reload } = useAsync(() => listarReclamos({ size: 100 }), []);
  const items = useMemo(() => data?.items ?? [], [data]);
  const barrios = useMemo(() => barriosDisponibles(items), [items]);
  const visibles = useMemo(
    () => filtrarFeed(items, { categoria, barrio, estado }),
    [items, categoria, barrio, estado],
  );

  return (
    <Stack gap="lg">
      <PageHeader
        icono={IconNews}
        titulo="Reclamos de la ciudad"
        descripcion="Los reclamos mas recientes reportados por los vecinos, mas nuevos primero."
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
              placeholder="Todos los barrios"
              clearable
              searchable
              data={barrios}
              value={barrio}
              onChange={setBarrio}
              aria-label="Filtrar por barrio"
              nothingFoundMessage="Sin barrios"
            />
            <Select
              w={190}
              placeholder="Todos los estados"
              clearable
              data={opcionesEstado()}
              value={estado}
              onChange={(v) => setEstado(v as EstadoReclamo | null)}
              aria-label="Filtrar por estado"
            />
          </Group>
          <Badge size="lg" variant="light" color="azulUrbano" radius="sm">
            {visibles.length} {visibles.length === 1 ? "reclamo" : "reclamos"}
          </Badge>
        </Group>
      </Card>

      {loading && (
        <Center py={64}>
          <Loader color="azulUrbano" />
        </Center>
      )}

      {error && <EstadoError mensaje={error} onReintentar={reload} />}

      {!loading && !error && visibles.length === 0 && (
        <EstadoVacio
          icono={IconNews}
          titulo="No hay reclamos para mostrar"
          mensaje="Todavia no hay reclamos publicos o ninguno coincide con los filtros elegidos."
        />
      )}

      <Grid>
        {visibles.map((reclamo) => (
          <Grid.Col key={reclamo.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <ReclamoCard reclamo={reclamo} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
