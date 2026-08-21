import { useMemo, useState } from "react";
import {
  Alert,
  Card,
  Center,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertTriangle, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { listarReclamos } from "@/api/reclamos";
import { EstadoReclamo } from "@/domain/enums";
import { haceCuanto, idCorto } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "@/features/reclamos/Badges";

const ENTRANTES = new Set<EstadoReclamo>([EstadoReclamo.RECIBIDO, EstadoReclamo.EN_REVISION]);

/**
 * Backoffice inbox for operators and admins (US-13). Lists incoming claims to
 * triage, newest first, with category, priority and support count, and opens
 * the detail where the state can be managed.
 */
export function BandejaPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<"entrantes" | "todos">("entrantes");

  const { data, loading, error } = useAsync(() => listarReclamos({ orden: "recientes" }), []);

  const filas = useMemo(() => {
    const items = data?.items ?? [];
    const visibles = filtro === "entrantes" ? items.filter((r) => ENTRANTES.has(r.estado)) : items;
    return [...visibles].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [data, filtro]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Bandeja de reclamos</Title>
          <Text c="dimmed">Gestion de reclamos entrantes. Priorizacion y seguimiento.</Text>
        </div>
        <SegmentedControl
          value={filtro}
          onChange={(v) => setFiltro(v as "entrantes" | "todos")}
          data={[
            { label: "Entrantes", value: "entrantes" },
            { label: "Todos", value: "todos" },
          ]}
        />
      </Group>

      {loading && (
        <Center py="xl">
          <Loader color="azulUrbano" />
        </Center>
      )}

      {error && (
        <Alert
          color="rojoEmergencia"
          icon={<IconAlertTriangle size={16} />}
          title="No se pudo cargar"
        >
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Card withBorder radius="md" padding={0}>
          <Table.ScrollContainer minWidth={720}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Reclamo</Table.Th>
                  <Table.Th>Categoria</Table.Th>
                  <Table.Th>Prioridad</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Adhesiones</Table.Th>
                  <Table.Th>Ingreso</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filas.map((r) => (
                  <Table.Tr
                    key={r.id}
                    onClick={() => navigate(`/reclamos/${r.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td>
                      <Text fw={600} lineClamp={1}>
                        {r.titulo}
                      </Text>
                      <Text size="xs" c="dimmed" ff="monospace">
                        {idCorto(r.id)} · {r.barrio ?? "Sin barrio"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <CategoriaBadge categoria={r.categoria} />
                    </Table.Td>
                    <Table.Td>
                      <PrioridadBadge prioridad={r.prioridad} />
                    </Table.Td>
                    <Table.Td>
                      <EstadoBadge estado={r.estado} />
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <IconUsers size={14} />
                        <Text size="sm">{r.adhesiones_count}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {haceCuanto(r.created_at)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {filas.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              No hay reclamos para mostrar.
            </Text>
          )}
        </Card>
      )}
    </Stack>
  );
}
