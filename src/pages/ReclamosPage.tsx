import { useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconChecks,
  IconInbox,
  IconPlus,
  IconProgress,
  IconSearch,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { listarReclamos } from "@/api/reclamos";
import type { CategoriaReclamo } from "@/domain/enums";
import { opcionesCategoria } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";
import { TABS, contarPorTab, filtrarReclamos, type TabReclamos } from "@/features/reclamos/filters";

function StatTile({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: ReactNode;
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text fz={28} fw={700} lh={1.1}>
            {value}
          </Text>
        </div>
        <ThemeIcon size={42} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

export function ReclamosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabReclamos>("todos");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);

  const { data, loading, error } = useAsync(() => listarReclamos(), []);
  const items = useMemo(() => data?.items ?? [], [data]);
  const counts = useMemo(() => contarPorTab(items), [items]);
  const visibles = useMemo(
    () => filtrarReclamos(items, tab, texto, categoria),
    [items, tab, texto, categoria],
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Mis reclamos</Title>
          <Text c="dimmed">Crea, segui y gestiona tus reclamos en la ciudad.</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          color="azulUrbano"
          onClick={() => navigate("/reclamos/nuevo")}
        >
          Nuevo reclamo
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatTile
          label="Total"
          value={counts.todos}
          color="azulUrbano"
          icon={<IconInbox size={22} />}
        />
        <StatTile
          label="Abiertos"
          value={counts.abiertos}
          color="azulUrbano"
          icon={<IconInbox size={22} />}
        />
        <StatTile
          label="En proceso"
          value={counts.en_proceso}
          color="ambar"
          icon={<IconProgress size={22} />}
        />
        <StatTile
          label="Resueltos"
          value={counts.resueltos}
          color="verdeUrbano"
          icon={<IconChecks size={22} />}
        />
      </SimpleGrid>

      <Card withBorder radius="md" padding="md">
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Tabs
              value={tab}
              onChange={(v) => setTab((v ?? "todos") as TabReclamos)}
              variant="pills"
            >
              <Tabs.List>
                {TABS.map((t) => (
                  <Tabs.Tab
                    key={t.value}
                    value={t.value}
                    rightSection={
                      <Badge size="xs" variant="light" circle>
                        {counts[t.value]}
                      </Badge>
                    }
                  >
                    {t.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
            <Group gap="sm">
              <Select
                w={190}
                placeholder="Todas las categorias"
                clearable
                data={opcionesCategoria()}
                value={categoria}
                onChange={(v) => setCategoria(v as CategoriaReclamo | null)}
                aria-label="Filtrar por categoria"
              />
              <TextInput
                w={220}
                placeholder="Buscar por titulo"
                leftSection={<IconSearch size={16} />}
                value={texto}
                onChange={(e) => setTexto(e.currentTarget.value)}
              />
            </Group>
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

          {!loading && !error && visibles.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              No hay reclamos para mostrar.
            </Text>
          )}

          <Grid>
            {visibles.map((reclamo) => (
              <Grid.Col key={reclamo.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <ReclamoCard reclamo={reclamo} />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Card>
    </Stack>
  );
}
