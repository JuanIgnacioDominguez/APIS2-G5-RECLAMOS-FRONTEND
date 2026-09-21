import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconShieldCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { comentar } from "@/api/reclamos";
import type { ComentarioOut } from "@/api/types";
import { haceCuanto } from "@/lib/format";

/** Renders one comment; official replies (US-12) get a highlighted card. */
function Comentario({ comentario }: { comentario: ComentarioOut }) {
  const cabecera = (
    <Group gap="xs" mb={2}>
      <Text size="sm" fw={600}>
        {comentario.autor_nombre ?? comentario.autor_id}
      </Text>
      <Text size="xs" c="dimmed">
        {haceCuanto(comentario.created_at)}
      </Text>
    </Group>
  );

  if (comentario.es_oficial) {
    return (
      <Box
        data-testid="comentario-oficial"
        p="sm"
        style={{
          borderRadius: "var(--mantine-radius-md)",
          border: "1px solid var(--mantine-color-verdeUrbano-3)",
          backgroundColor: "var(--mantine-color-verdeUrbano-0)",
        }}
      >
        <Group gap="xs" mb={4}>
          <ThemeIcon size="sm" radius="xl" variant="light" color="verdeUrbano">
            <IconShieldCheck size={13} />
          </ThemeIcon>
          <Text size="sm" fw={600}>
            {comentario.autor_nombre ?? comentario.autor_id}
          </Text>
          <Badge size="xs" color="verdeUrbano" variant="filled" radius="sm">
            Respuesta oficial
          </Badge>
          <Text size="xs" c="dimmed">
            {haceCuanto(comentario.created_at)}
          </Text>
        </Group>
        <Text size="sm">{comentario.texto}</Text>
      </Box>
    );
  }

  return (
    <div>
      {cabecera}
      <Text size="sm">{comentario.texto}</Text>
    </div>
  );
}

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
          <Comentario key={c.id} comentario={c} />
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
