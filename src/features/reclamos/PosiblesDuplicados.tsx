import { Link } from "react-router-dom";
import { Copy, MapPin } from "lucide-react";

import { useSimilaresDeQuery } from "@/store/citypassApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "./EstadoBadges";

function textoDistancia(metros: number | null): string | null {
  if (metros === null) return null;
  if (metros < 1000) return `a ${metros} m`;
  return `a ${(metros / 1000).toFixed(1)} km`;
}

export function PosiblesDuplicados({ reclamoId }: { reclamoId: string }) {
  const { data } = useSimilaresDeQuery(reclamoId);
  const similares = data ?? [];
  if (similares.length === 0) return null;

  return (
    <Card className="border-warning/30 sm:col-span-2 lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Copy className="size-4 text-warning" />
          Posibles duplicados
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {similares.map((r) => {
          const distancia = textoDistancia(r.distancia_metros);
          return (
            <Link
              key={r.id}
              to={`/reclamos/${r.id}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 transition-colors hover:bg-muted/60"
            >
              <span className="min-w-0 flex-1 truncate font-medium">{r.titulo}</span>
              <EstadoBadge estado={r.estado} />
              {distancia && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {distancia}
                </span>
              )}
              {r.terminos_en_comun.length > 0 && (
                <span className="w-full text-xs text-muted-foreground">
                  Coinciden: {r.terminos_en_comun.join(", ")}
                </span>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
