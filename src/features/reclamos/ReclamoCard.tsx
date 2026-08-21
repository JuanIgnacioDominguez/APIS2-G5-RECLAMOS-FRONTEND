import { Card, Group, Stack, Text, Badge } from "@mantine/core";
import { IconMapPin, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import type { ReclamoResumen } from "@/api/types";
import { haceCuanto, idCorto } from "@/lib/format";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "./Badges";

export function ReclamoCard({ reclamo }: { reclamo: ReclamoResumen }) {
  const navigate = useNavigate();

  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      onClick={() => navigate(`/reclamos/${reclamo.id}`)}
      style={{ cursor: "pointer" }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} lineClamp={1}>
            {reclamo.titulo}
          </Text>
          <EstadoBadge estado={reclamo.estado} />
        </Group>

        <Group gap="xs">
          <CategoriaBadge categoria={reclamo.categoria} />
          <PrioridadBadge prioridad={reclamo.prioridad} />
        </Group>

        <Group justify="space-between" c="dimmed">
          <Group gap={4}>
            <IconMapPin size={14} />
            <Text size="sm">{reclamo.barrio ?? "Sin barrio"}</Text>
          </Group>
          <Group gap="md">
            {reclamo.adhesiones_count > 0 && (
              <Badge
                color="azulUrbano"
                variant="light"
                leftSection={<IconUsers size={12} />}
                radius="sm"
              >
                {reclamo.adhesiones_count}
              </Badge>
            )}
            <Text size="xs">{haceCuanto(reclamo.created_at)}</Text>
          </Group>
        </Group>

        <Text size="xs" c="dimmed" ff="monospace">
          {idCorto(reclamo.id)}
        </Text>
      </Stack>
    </Card>
  );
}
