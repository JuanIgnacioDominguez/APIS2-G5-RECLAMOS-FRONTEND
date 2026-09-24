import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Users } from "lucide-react";

import type { ReclamoResumen } from "@/api/types";
import type { Miga } from "@/config/navigation";
import { haceCuanto, idCorto } from "@/lib/format";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import { AutoriaBadge, CategoriaLinea, EstadoBadge, PrioridadLinea } from "./EstadoBadges";

export function ReclamoCard({
  reclamo,
  autoria,
  origen,
}: {
  reclamo: ReclamoResumen;
  /** Ownership relative to the current user, when the screen can tell:
   * "mio" for the citizen's own claims, "ciudad" for the rest of the city.
   * Left out (e.g. contexts where authorship is not known) hides the tag. */
  autoria?: "mio" | "ciudad";
  /** Breadcrumb parent the detail page should show when opened from this card
   * (e.g. "Reclamos de la ciudad" from the public feed), instead of defaulting
   * to "Mis reclamos" / "Todos los reclamos". */
  origen?: Miga;
}) {
  return (
    <Link
      to={`/reclamos/${reclamo.id}`}
      state={origen ? { origen } : undefined}
      className="group block h-full outline-none"
    >
      <Card
        className={cn(
          "h-full gap-0 transition duration-200 ease-out",
          "group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-primary/30",
          "group-focus-visible:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-primary",
        )}
      >
        <CardContent className="flex h-full flex-col gap-3">
          {/* Level 1 (scan): where the claim stands + whose it is. */}
          <div className="flex items-center justify-between gap-2">
            <EstadoBadge estado={reclamo.estado} />
            {autoria && <AutoriaBadge mio={autoria === "mio"} />}
          </div>

          {/* Level 2 (read): the title, reserving two lines so cards align. */}
          <p className="line-clamp-2 min-h-[3.25rem] text-lg font-bold leading-snug text-foreground">
            {reclamo.titulo}
          </p>

          {/* Level 3 (inspect): classification. The category icon carries its
              brand color (same as the feed filters); the label stays neutral
              so only the state badge and priority dominate. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-foreground/80">
            <CategoriaLinea categoria={reclamo.categoria} />
            <span aria-hidden className="text-foreground/30">
              |
            </span>
            <PrioridadLinea prioridad={reclamo.prioridad} />
          </div>

          {/* Footer: location, support and identity. */}
          <div className="mt-auto flex flex-col gap-2 border-t pt-3 text-foreground/70">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{reclamo.barrio ?? "Sin barrio"}</span>
              </span>
              <div className="flex shrink-0 items-center gap-3">
                {reclamo.adhesiones_count > 0 && (
                  <span
                    className="inline-flex items-center gap-1 tabular-nums"
                    title={`${reclamo.adhesiones_count} adhesiones`}
                  >
                    <Users className="size-3.5" />
                    {reclamo.adhesiones_count}
                  </span>
                )}
                <span className="text-xs whitespace-nowrap">{haceCuanto(reclamo.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xs text-foreground/55">{idCorto(reclamo.id)}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Ver detalle
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
