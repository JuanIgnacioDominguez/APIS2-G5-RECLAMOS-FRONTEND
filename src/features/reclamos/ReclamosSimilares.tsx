import { Link } from "react-router-dom";
import { Loader2, MapPin, Users } from "lucide-react";

import type { ReclamoSimilar } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EstadoBadge } from "./EstadoBadges";

function textoDistancia(metros: number | null): string | null {
  if (metros === null) return null;
  if (metros < 1000) return `a ${metros} m`;
  return `a ${(metros / 1000).toFixed(1)} km`;
}

function TarjetaSimilar({
  reclamo,
  onSumarme,
  procesando,
}: {
  reclamo: ReclamoSimilar;
  onSumarme: (id: string) => void;
  procesando: boolean;
}) {
  const distancia = textoDistancia(reclamo.distancia_metros);
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/reclamos/${reclamo.id}`}
          className="font-medium hover:underline"
          state={{ origen: { label: "Nuevo reclamo", to: "/reclamos/nuevo" } }}
        >
          {reclamo.titulo}
        </Link>
        <EstadoBadge estado={reclamo.estado} />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {distancia && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {distancia}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="size-3.5" />
          {reclamo.adhesiones_count}{" "}
          {reclamo.adhesiones_count === 1 ? "vecino ya lo reporto" : "vecinos ya lo reportaron"}
        </span>
      </div>

      {reclamo.terminos_en_comun.length > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Coinciden: {reclamo.terminos_en_comun.join(", ")}
        </p>
      )}

      <div className="mt-3">
        {reclamo.es_propio ? (
          <Badge variant="secondary" className="font-normal">
            Ya reportaste esto
          </Badge>
        ) : reclamo.ya_adherido ? (
          <Badge variant="secondary" className="font-normal">
            Ya te sumaste
          </Badge>
        ) : (
          <Button
            size="sm"
            disabled={procesando}
            onClick={() => onSumarme(reclamo.id)}
            className="gap-2"
          >
            <Users className="size-4" />
            Es este, sumarme
          </Button>
        )}
      </div>
    </div>
  );
}

export function ReclamosSimilaresDialog({
  open,
  onOpenChange,
  similares,
  onSumarme,
  onCargarIgual,
  procesando,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similares: ReclamoSimilar[];
  onSumarme: (id: string) => void;
  onCargarIgual: () => void;
  procesando: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Es alguno de estos?</DialogTitle>
          <DialogDescription>
            Otros vecinos ya reportaron algo parecido. Sumarte ayuda a que se resuelva antes que
            cargar un reclamo repetido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          {similares.map((r) => (
            <TarjetaSimilar key={r.id} reclamo={r} onSumarme={onSumarme} procesando={procesando} />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={procesando} onClick={onCargarIgual} className="gap-2">
            {procesando && <Loader2 className="size-4 animate-spin" />}
            No, es otro problema — cargar igual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
