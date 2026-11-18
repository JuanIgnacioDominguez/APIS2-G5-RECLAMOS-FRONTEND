import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import type { ActividadVinculada } from "@/api/types";
import { formatHorarioActividad } from "@/lib/format";
import { rutaReclamosDeActividad } from "./actividades";

// Compact chip for list cards and tables. It is not a link on purpose: cards
// are links themselves and nesting anchors is invalid.
export function BadgeActividadRelacionada({ actividad }: { actividad: ActividadVinculada }) {
  return (
    <span
      title={formatHorarioActividad(actividad.inicio, actividad.fin)}
      className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary"
    >
      <CalendarDays className="size-3 shrink-0" />
      <span className="truncate">Relacionado con: {actividad.titulo}</span>
    </span>
  );
}

// Notice for the claim detail: names the event, its window and links to every
// claim related to it.
export function AvisoActividadRelacionada({ actividad }: { actividad: ActividadVinculada }) {
  return (
    <div
      role="note"
      aria-label="Actividad masiva relacionada"
      className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
        <CalendarDays className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">Relacionado con: {actividad.titulo}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">
          {formatHorarioActividad(actividad.inicio, actividad.fin)} (hora de Buenos Aires).{" "}
          <Link
            to={rutaReclamosDeActividad(actividad.id)}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Ver los reclamos de esta actividad
          </Link>
        </p>
      </div>
    </div>
  );
}
