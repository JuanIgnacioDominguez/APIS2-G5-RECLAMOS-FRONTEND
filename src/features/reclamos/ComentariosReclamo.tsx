import { useState } from "react";
import { Loader2, MessageSquare, ShieldCheck, Workflow } from "lucide-react";
import { toast } from "sonner";

import { useComentarMutation } from "@/store/citypassApi";
import type { ComentarioOut } from "@/api/types";
import { esRateLimit } from "@/lib/erroresApi";
import { useEsperaRateLimit } from "@/hooks/useEsperaRateLimit";
import { useAuth } from "@/auth/AuthContext";
import { USUARIO_SISTEMA } from "@/domain/enums";
import { haceCuanto } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

function iniciales(nombre: string | null | undefined): string {
  const partes = (nombre ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

function ComentarioAutomatico({ comentario }: { comentario: ComentarioOut }) {
  return (
    <div
      data-testid="comentario-automatico"
      className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
          <Workflow className="size-3.5" />
        </span>
        <span className="text-sm font-semibold">{comentario.autor_nombre ?? "CityPass+"}</span>
        <Badge variant="outline" className="border-primary/30 text-primary">
          Automático
        </Badge>
        <span className="text-xs text-muted-foreground">{haceCuanto(comentario.created_at)}</span>
      </div>
      <p className="text-sm leading-relaxed">{comentario.texto}</p>
    </div>
  );
}

function Comentario({ comentario }: { comentario: ComentarioOut }) {
  if (comentario.autor_id === USUARIO_SISTEMA) {
    return <ComentarioAutomatico comentario={comentario} />;
  }

  if (comentario.es_oficial) {
    return (
      <div
        data-testid="comentario-oficial"
        className="rounded-xl border border-official/35 bg-official/8 p-4"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-official text-xs font-semibold text-on-official">
            {iniciales(comentario.autor_nombre ?? comentario.autor_id)}
          </span>
          <ShieldCheck className="size-4 text-official" />
          <span className="text-sm font-semibold">
            {comentario.autor_nombre ?? comentario.autor_id}
          </span>
          <Badge className="border-transparent bg-official text-on-official">
            Respuesta oficial
          </Badge>
          <span className="text-xs text-muted-foreground">{haceCuanto(comentario.created_at)}</span>
        </div>
        <p className="text-sm leading-relaxed">{comentario.texto}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {iniciales(comentario.autor_nombre ?? comentario.autor_id)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            {comentario.autor_nombre ?? comentario.autor_id}
          </span>
          <span className="text-xs text-muted-foreground">{haceCuanto(comentario.created_at)}</span>
        </div>
        <p className="text-sm leading-relaxed">{comentario.texto}</p>
      </div>
    </div>
  );
}

export function ComentariosReclamo({
  reclamoId,
  comentarios,
  onComentado,
}: {
  reclamoId: string;
  comentarios: ComentarioOut[];
  onComentado?: () => void;
}) {
  const { usuario } = useAuth();
  const [texto, setTexto] = useState("");
  const [comentar, { isLoading: enviando }] = useComentarMutation();
  const espera = useEsperaRateLimit();

  async function enviar() {
    const limpio = texto.trim();
    // Guard here too: a keyboard shortcut or a duplicate event can fire before
    // React re-renders the disabled button.
    if (!limpio || enviando || espera.enEspera) return;
    try {
      await comentar({ id: reclamoId, texto: limpio }).unwrap();
      setTexto("");
      toast.success("Comentario publicado");
      onComentado?.();
    } catch (err) {
      if (esRateLimit(err)) {
        // Keep the typed text and block this action for the cooldown.
        espera.iniciar();
      }
      toast.error("No se pudo comentar", {
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Error inesperado",
      });
    }
  }

  return (
    <Card className="rounded-2xl ring-1 ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="size-[18px] text-primary" />
          Comentarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comentarios.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-1 text-sm text-muted-foreground">
            <MessageSquare className="size-4" />
            Todavía no hay comentarios.
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <Comentario key={comentario.id} comentario={comentario} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {iniciales(usuario?.nombre)}
          </span>
          <Textarea
            placeholder="Escribí un comentario..."
            rows={1}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void enviar();
            }}
            aria-label="Nuevo comentario"
            className="min-h-10 resize-none"
          />
          <Button
            type="button"
            disabled={!texto.trim() || enviando || espera.enEspera}
            onClick={enviar}
            className="min-w-24"
          >
            {enviando && <Loader2 className="animate-spin" />}
            Comentar
          </Button>
        </div>
        {espera.enEspera && (
          <p role="status" className="text-xs text-muted-foreground">
            Hiciste demasiados intentos. Probá de nuevo en {espera.restante}s.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
