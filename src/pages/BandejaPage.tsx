import { Badge, Card, Center, Group, Loader, Stack, Table, Text } from "@mantine/core";
import { IconInbox, IconSparkles, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { bandeja } from "@/api/reclamos";
import { OrigenClasificacion } from "@/domain/enums";
import { ORIGEN_LABEL } from "@/domain/labels";
import { haceCuanto, idCorto } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { EstadoError } from "@/components/EstadoError";
import { EstadoVacio } from "@/components/EstadoVacio";
import { PageHeader } from "@/components/PageHeader";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "@/features/reclamos/Badges";

/**
 * Backoffice inbox for operators and admins (US-13). Reads the dedicated
 * `/reclamos/bandeja` endpoint: incoming claims (recibido / en revision) newest
 * first, with the AI-suggested category, priority and support count.
 */
export function BandejaPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => bandeja(), []);
  const filas = data?.items ?? [];

  return (
    <Stack gap="lg">
      <PageHeader
        icono={IconInbox}
        titulo="Bandeja de reclamos"
        descripcion="Reclamos entrantes pendientes de clasificar, mas recientes primero."
        accion={
          !loading &&
          !error && (
            <Badge size="lg" variant="light" color="azulUrbano" radius="sm">
              {filas.length} {filas.length === 1 ? "reclamo" : "reclamos"}
            </Badge>
          )
        }
      />

      {loading && (
        <Center py={64}>
          <Loader color="azulUrbano" />
        </Center>
      )}

      {error && <EstadoError mensaje={error} onReintentar={reload} />}

      {!loading && !error && filas.length === 0 && (
        <Card withBorder radius="md" padding="xl">
          <EstadoVacio
            icono={IconInbox}
            titulo="Bandeja al dia"
            mensaje="No hay reclamos entrantes pendientes de clasificar en este momento."
          />
        </Card>
      )}

      {!loading && !error && filas.length > 0 && (
        <Card withBorder radius="md" padding={0}>
          <Table.ScrollContainer minWidth={720}>
            <Table highlightOnHover verticalSpacing="md">
              <Table.Thead bg="gray.0">
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
                    className="row-interactive"
                    onClick={() => navigate(`/reclamos/${r.id}`)}
                  >
                    <Table.Td>
                      <Text fw={600} lineClamp={1}>
                        {r.titulo}
                      </Text>
                      <Text size="xs" c="dimmed" ff="monospace">
                        {idCorto(r.id)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <CategoriaBadge categoria={r.categoria} />
                        {r.origen_clasificacion === OrigenClasificacion.MODELO && (
                          <Badge
                            size="xs"
                            variant="light"
                            color="azulUrbano"
                            leftSection={<IconSparkles size={11} />}
                            radius="sm"
                          >
                            {ORIGEN_LABEL[OrigenClasificacion.MODELO]}
                          </Badge>
                        )}
                      </Group>
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
        </Card>
      )}
    </Stack>
  );
}
