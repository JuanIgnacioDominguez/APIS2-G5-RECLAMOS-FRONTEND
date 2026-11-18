import { CloudLightning } from "lucide-react";

import { NivelCriticidad } from "@/domain/enums";
import { cn } from "cn";
import {
  NIVEL_ALERTA_CLASES,
  NIVEL_ALERTA_CLASES_SIN_NIVEL,
  NIVEL_ALERTA_LABEL,
  textoBadgeAlerta,
} from "./nivelAlerta";

// Shared wording for the citizen. It never promises a deadline and never says
// "we cannot resolve it": Reclamos manages the record, it does not resolve.
export const MENSAJE_ALERTA_CLIMATICA =
  "La gestión de tu reclamo puede demorarse; te avisamos cuando termine.";

export const TITULO_ALERTA_CLIMATICA = "Alerta climática activa en tu zona";

// Wording for municipal staff: same alert, but it speaks about the claim and
// not to the neighbour, and it does not promise anything on the area's behalf.
export const TITULO_ALERTA_CLIMATICA_STAFF = "Reclamo bajo alerta climática";
export const MENSAJE_ALERTA_CLIMATICA_STAFF =
  "El vecino ya recibió el aviso de que la gestión puede demorarse. Tenelo en cuenta al priorizar.";

// ALTA and CRITICA read as the loud, destructive styling; the lower levels use
// the calmer warning palette.
function esFuerte(nivel: NivelCriticidad | null): boolean {
  return nivel === NivelCriticidad.ALTA || nivel === NivelCriticidad.CRITICA;
}

function clasesNivel(nivel: NivelCriticidad | null): string {
  return nivel ? NIVEL_ALERTA_CLASES[nivel] : NIVEL_ALERTA_CLASES_SIN_NIVEL;
}

interface AvisoAlertaProps {
  nivel: NivelCriticidad | null;
  /** Who reads the notice: the neighbour (default) or municipal staff. */
  paraStaff?: boolean;
}

export function AvisoAlertaClimatica({ nivel, paraStaff = false }: AvisoAlertaProps) {
  const fuerte = esFuerte(nivel);
  const titulo = paraStaff ? TITULO_ALERTA_CLIMATICA_STAFF : TITULO_ALERTA_CLIMATICA;
  const mensaje = paraStaff ? MENSAJE_ALERTA_CLIMATICA_STAFF : MENSAJE_ALERTA_CLIMATICA;
  return (
    <div
      role="note"
      aria-label="Alerta climática"
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3",
        fuerte ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning-surface",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          fuerte ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning",
        )}
      >
        <CloudLightning className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("text-sm font-semibold", fuerte ? "text-destructive" : "text-warning")}>
            {titulo}
          </p>
          {nivel && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs font-semibold",
                NIVEL_ALERTA_CLASES[nivel],
              )}
            >
              Nivel {NIVEL_ALERTA_LABEL[nivel]}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">{mensaje}</p>
      </div>
    </div>
  );
}

// Compact chip for list cards and tables. The colour follows the alert level.
export function BadgeAlertaClimatica({ nivel = null }: { nivel?: NivelCriticidad | null }) {
  const texto = textoBadgeAlerta(nivel);
  return (
    <span
      role="img"
      aria-label={texto}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
        clasesNivel(nivel),
      )}
    >
      <CloudLightning className="size-3" />
      {texto}
    </span>
  );
}
