import { useState } from "react";
import { Badge, Button, Card, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { comentar } from "@/api/reclamos";
import type { ComentarioOut } from "@/api/types";
import { haceCuanto } from "@/lib/format";

/**
 * Comment thread of a claim (US-16). Anyone authenticated can add a comment; the
 * backend marks staff comments as "oficial". After posting, the parent reloads
 * the detail so the new comment and any state change show up.
 */
export function ComentariosReclamo({
  reclamoId,
  comentarios,
  onComentado,
}: {
  reclamoId: string;
  comentarios: ComentarioOut[];
  onComentado: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const limpio = texto.trim();
    if (!limpio) return;
    setEnviando(true);
    try {
      await comentar(reclamoId, limpio);
      setTexto("");
      onComentado();
    } catch (err) {
      notifications.show({
        color: "rojoEmergencia",
        title: "No se pudo comentar",
        message: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Title order={5} mb="md">
        Comentarios
      </Title>

      <Stack gap="md">
        {comentarios.length === 0 && (
          <Text c="dimmed" size="sm">
            Todavia no hay comentarios.
          </Text>
        )}

        {comentarios.map((c) => (
          <div key={c.id}>
            <Group gap="xs" mb={2}>
              <Text size="sm" fw={600}>
                {c.autor_nombre ?? c.autor_id}
              </Text>
              {c.es_oficial && (
                <Badge size="xs" color="verdeUrbano" variant="light" radius="sm">
                  Oficial
                </Badge>
              )}
              <Text size="xs" c="dimmed">
                {haceCuanto(c.created_at)}
              </Text>
            </Group>
            <Text size="sm">{c.texto}</Text>
          </div>
        ))}

        <Stack gap="xs">
          <Textarea
            placeholder="Escribi un comentario"
            autosize
            minRows={2}
            value={texto}
            onChange={(e) => setTexto(e.currentTarget.value)}
            aria-label="Nuevo comentario"
          />
          <Group justify="flex-end">
            <Button
              size="sm"
              color="azulUrbano"
              loading={enviando}
              disabled={!texto.trim()}
              onClick={enviar}
            >
              Comentar
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}
