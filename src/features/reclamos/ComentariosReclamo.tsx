import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { comentar } from "@/api/reclamos";
import type { ComentarioOut } from "@/api/types";
import { haceCuanto } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/** Renders one comment; official replies (US-12) get a highlighted card. */
function Comentario({ comentario }: { comentario: ComentarioOut }) {
  if (comentario.es_oficial) {
    return (
      <div
        data-testid="comentario-oficial"
        className="rounded-lg border border-[color-mix(in_oklab,var(--chart-2)_35%,transparent)] bg-[color-mix(in_oklab,var(--chart-2)_8%,transparent)] p-3"
      >
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="flex size-5 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--chart-2)_18%,transparent)] text-[var(--chart-2)]">
            <ShieldCheck className="size-3" />
          </span>
          <span className="text-sm font-semibold">
            {comentario.autor_nombre ?? comentario.autor_id}
          </span>
          <Badge className="border-transparent bg-[var(--chart-2)] text-white">
            Respuesta oficial
          </Badge>
          <span className="text-xs text-muted-foreground">{haceCuanto(comentario.created_at)}</span>
        </div>
        <p className="text-sm">{comentario.texto}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1.5">
        <span className="text-sm font-semibold">
          {comentario.autor_nombre ?? comentario.autor_id}
        </span>
        <span className="text-xs text-muted-foreground">{haceCuanto(comentario.created_at)}</span>
      </div>
      <p className="text-sm">{comentario.texto}</p>
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
      toast.error("No se pudo comentar", {
        description: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comentarios</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {comentarios.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavia no hay comentarios.</p>
        )}

        {comentarios.map((c) => (
          <Comentario key={c.id} comentario={c} />
        ))}

        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Escribi un comentario"
            rows={2}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Nuevo comentario"
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={!texto.trim() || enviando} onClick={enviar}>
              {enviando && <Loader2 className="animate-spin" />}
              Comentar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
