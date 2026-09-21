import { useState } from "react";
import { Button, Card, Select, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { reclasificar } from "@/api/reclamos";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import { opcionesCategoria, opcionesPrioridad } from "@/domain/labels";

/**
 * Staff-only control to correct a claim's category and priority (US-14), via
 * `PATCH /reclamos/{id}/clasificacion`. Does not change the claim's state.
 */
export function ClasificarReclamo({
  reclamoId,
  categoriaActual,
  prioridadActual,
  onActualizado,
}: {
  reclamoId: string;
  categoriaActual: CategoriaReclamo;
  prioridadActual: PrioridadReclamo;
  onActualizado: () => void;
}) {
  const [categoria, setCategoria] = useState<string | null>(categoriaActual);
  const [prioridad, setPrioridad] = useState<string | null>(prioridadActual);
  const [guardando, setGuardando] = useState(false);

  const sinCambios = categoria === categoriaActual && prioridad === prioridadActual;

  async function aplicar() {
    setGuardando(true);
    try {
      await reclasificar(reclamoId, {
        categoria: categoria as CategoriaReclamo | null,
        prioridad: prioridad as PrioridadReclamo | null,
      });
      notifications.show({
        color: "verdeUrbano",
        title: "Reclamo clasificado",
        message: "Se actualizo la categoria y/o prioridad.",
      });
      onActualizado();
    } catch (err) {
      notifications.show({
        color: "rojoEmergencia",
        title: "No se pudo clasificar",
        message: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={5} mb="md">
        Clasificacion
      </Title>
      <Stack gap="sm">
        <Select
          label="Categoria"
          data={opcionesCategoria()}
          value={categoria}
          onChange={setCategoria}
          allowDeselect={false}
        />
        <Select
          label="Prioridad"
          data={opcionesPrioridad()}
          value={prioridad}
          onChange={setPrioridad}
          allowDeselect={false}
        />
        <Button color="azulUrbano" loading={guardando} disabled={sinCambios} onClick={aplicar}>
          Guardar clasificacion
        </Button>
      </Stack>
    </Card>
  );
}
