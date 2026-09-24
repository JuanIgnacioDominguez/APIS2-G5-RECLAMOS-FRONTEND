import { ListChecks, MapPin, Users } from "lucide-react";

import type { ReclamoResumen } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoriaBadge, CategoriaLinea, EstadoBadge, PrioridadLinea } from "./EstadoBadges";

export function ReclamoResumenCard({
  reclamo,
  esPropio,
}: {
  reclamo: ReclamoResumen;
  esPropio?: boolean;
}) {
  return (
    <Card className="h-full rounded-2xl ring-1 ring-border" data-testid="reclamo-resumen-card">
      <CardHeader>
        <CardTitle
          role="heading"
          aria-level={2}
          className="flex items-center gap-2 text-base font-semibold"
        >
          <ListChecks className="size-[18px] text-primary" strokeWidth={2.2} />
          Clasificación
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Estado actual
            </span>
            <EstadoBadge estado={reclamo.estado} />
          </div>
          {esPropio !== undefined && <AutoriaBadge mio={esPropio} />}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tipo
            </p>
            <div className="mt-2 text-sm font-medium text-foreground/80">
              <CategoriaLinea categoria={reclamo.categoria} />
            </div>
          </div>
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Prioridad
            </p>
            <div className="mt-2 text-sm font-medium text-foreground/80">
              <PrioridadLinea prioridad={reclamo.prioridad} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm text-foreground/70">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{reclamo.barrio ?? "Sin barrio"}</span>
          </span>
          <span
            className="inline-flex items-center gap-1 tabular-nums"
            title={`${reclamo.adhesiones_count} adhesiones`}
          >
            <Users className="size-3.5" />
            {reclamo.adhesiones_count} adhesiones
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
