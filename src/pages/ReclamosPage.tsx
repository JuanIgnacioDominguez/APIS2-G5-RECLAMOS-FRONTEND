import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Center,
  Grid,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertTriangle, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { listarReclamos } from "@/api/reclamos";
import type { EstadoReclamo } from "@/domain/enums";
import { opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";

export function ReclamosPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);
  const [texto, setTexto] = useState("");

  const { data, loading, error } = useAsync(
    () => listarReclamos({ estado: estado ?? undefined }),
    [estado],
  );

  const items = useMemo(() => {
    const all = data?.items ?? [];
    const q = texto.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => r.titulo.toLowerCase().includes(q));
  }, [data, texto]);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
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

      <Group>
        <TextInput
          flex={1}
          placeholder="Buscar por titulo"
          leftSection={<IconSearch size={16} />}
          value={texto}
          onChange={(e) => setTexto(e.currentTarget.value)}
        />
        <Select
          placeholder="Todos los estados"
          clearable
          data={opcionesEstado()}
          value={estado}
          onChange={(v) => setEstado(v as EstadoReclamo | null)}
          w={220}
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

      {!loading && !error && items.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No hay reclamos para mostrar.
        </Text>
      )}

      <Grid>
        {items.map((reclamo) => (
          <Grid.Col key={reclamo.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <ReclamoCard reclamo={reclamo} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
