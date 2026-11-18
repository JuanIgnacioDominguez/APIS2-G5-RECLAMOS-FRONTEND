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

// ALTA and CRITICA read as the loud, destructive styling; the lower levels use
// the calmer warning palette.
function esFuerte(nivel: NivelCriticidad | null): boolean {
  return nivel === NivelCriticidad.ALTA || nivel === NivelCriticidad.CRITICA;
}

function clasesNivel(nivel: NivelCriticidad | null): string {
  return nivel ? NIVEL_ALERTA_CLASES[nivel] : NIVEL_ALERTA_CLASES_SIN_NIVEL;
}

export function AvisoAlertaClimatica({ nivel }: { nivel: NivelCriticidad | null }) {
  const fuerte = esFuerte(nivel);
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
            {TITULO_ALERTA_CLIMATICA}
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
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">
          {MENSAJE_ALERTA_CLIMATICA}
        </p>
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
