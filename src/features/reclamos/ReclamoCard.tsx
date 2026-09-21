import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";

import type { ReclamoResumen } from "@/api/types";
import { haceCuanto, idCorto } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "./EstadoBadges";

export function ReclamoCard({ reclamo }: { reclamo: ReclamoResumen }) {
  return (
    <Link to={`/reclamos/${reclamo.id}`} className="group block h-full">
      <Card className="h-full gap-0 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-primary/30">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 font-medium">{reclamo.titulo}</p>
            <EstadoBadge estado={reclamo.estado} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <CategoriaBadge categoria={reclamo.categoria} />
            <PrioridadBadge prioridad={reclamo.prioridad} />
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-sm">
              <MapPin className="size-3.5" />
              {reclamo.barrio ?? "Sin barrio"}
            </span>
            <div className="flex items-center gap-3">
              {reclamo.adhesiones_count > 0 && (
                <span className="inline-flex items-center gap-1 text-sm">
                  <Users className="size-3.5" />
                  {reclamo.adhesiones_count}
                </span>
              )}
              <span className="text-xs">{haceCuanto(reclamo.created_at)}</span>
            </div>
          </div>

          <p className="font-mono text-xs text-muted-foreground">{idCorto(reclamo.id)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
