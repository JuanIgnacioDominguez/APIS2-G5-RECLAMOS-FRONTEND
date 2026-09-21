import { useState } from "react";
import { Button, Card, Select, Stack, Text, Textarea, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { cambiarEstado } from "@/api/reclamos";
import { EstadoReclamo } from "@/domain/enums";
import { ESTADO_LABEL } from "@/domain/labels";
import { esFinal, transicionesDesde } from "@/domain/estados";

/**
 * Staff-only control to advance a claim through its state machine (US-16/17).
 * Only valid transitions are offered, so the backend never rejects the change.
 */
export function GestionarEstado({
  reclamoId,
  estadoActual,
  onActualizado,
}: {
  reclamoId: string;
  estadoActual: EstadoReclamo;
  onActualizado: () => void;
}) {
  const opciones = transicionesDesde(estadoActual);
  const [nuevo, setNuevo] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (esFinal(estadoActual) || opciones.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Title order={5} mb="xs">
          Gestion
        </Title>
        <Text c="dimmed" size="sm">
          El reclamo esta en un estado final; no admite mas cambios.
        </Text>
      </Card>
    );
  }

  const esResolucion = nuevo === EstadoReclamo.RESUELTO;

  async function aplicar() {
    if (!nuevo) return;
    setGuardando(true);
    try {
      await cambiarEstado(reclamoId, {
        estado: nuevo as EstadoReclamo,
        motivo: motivo.trim() || null,
        resolucion: esResolucion ? motivo.trim() || null : null,
      });
      notifications.show({
        color: "verdeUrbano",
        title: "Estado actualizado",
        message: `El reclamo paso a ${ESTADO_LABEL[nuevo as EstadoReclamo]}.`,
      });
      setNuevo(null);
      setMotivo("");
      onActualizado();
    } catch (err) {
      notifications.show({
        color: "rojoEmergencia",
        title: "No se pudo cambiar el estado",
        message: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={5} mb="md">
        Gestion
      </Title>
      <Stack gap="sm">
        <Select
          label="Nuevo estado"
          placeholder="Elegi una transicion"
          data={opciones.map((e) => ({ value: e, label: ESTADO_LABEL[e] }))}
          value={nuevo}
          onChange={setNuevo}
        />
        <Textarea
          label={esResolucion ? "Resolucion" : "Motivo (opcional)"}
          placeholder={esResolucion ? "Describi como se resolvio" : "Nota para el historial"}
          autosize
          minRows={2}
          value={motivo}
          onChange={(e) => setMotivo(e.currentTarget.value)}
        />
        <Button color="azulUrbano" loading={guardando} disabled={!nuevo} onClick={aplicar}>
          Aplicar cambio
        </Button>
      </Stack>
    </Card>
  );
}
