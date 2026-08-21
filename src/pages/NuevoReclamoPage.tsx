import { useState } from "react";
import { Anchor, Breadcrumbs, Card, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

import { crearReclamo } from "@/api/reclamos";
import type { ReclamoCrear } from "@/api/types";
import { ReclamoForm } from "@/features/reclamos/ReclamoForm";

export function NuevoReclamoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(datos: ReclamoCrear) {
    setLoading(true);
    try {
      const reclamo = await crearReclamo(datos);
      notifications.show({
        color: "verdeUrbano",
        title: "Reclamo creado",
        message: "Ya podes seguir su estado.",
      });
      navigate(`/reclamos/${reclamo.id}`);
    } catch (err) {
      notifications.show({
        color: "rojoEmergencia",
        title: "No se pudo crear el reclamo",
        message: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack gap="lg" maw={720}>
      <Breadcrumbs>
        <Anchor onClick={() => navigate("/reclamos")}>Reclamos</Anchor>
        <Text>Nuevo</Text>
      </Breadcrumbs>

      <div>
        <Title order={2}>Nuevo reclamo</Title>
        <Text c="dimmed">
          Si no elegis categoria y prioridad, las sugiere el clasificador automatico.
        </Text>
      </div>

      <Card withBorder radius="md" padding="lg">
        <ReclamoForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </Stack>
  );
}
