import { NivelCriticidad } from "@/domain/enums";

// Human label of each alert level (user-facing text, in Spanish).
export const NIVEL_ALERTA_LABEL: Record<NivelCriticidad, string> = {
  [NivelCriticidad.BAJA]: "Baja",
  [NivelCriticidad.MEDIA]: "Media",
  [NivelCriticidad.ALTA]: "Alta",
  [NivelCriticidad.CRITICA]: "Crítica",
};

const SEVERIDAD: Record<NivelCriticidad, number> = {
  [NivelCriticidad.BAJA]: 1,
  [NivelCriticidad.MEDIA]: 2,
  [NivelCriticidad.ALTA]: 3,
  [NivelCriticidad.CRITICA]: 4,
};

// Tailwind classes per level, built only from theme tokens (never raw hex).
// Each level reads differently at a glance: BAJA is muted, MEDIA is amber,
// ALTA is a soft red and CRITICA is the solid red.
export const NIVEL_ALERTA_CLASES: Record<NivelCriticidad, string> = {
  [NivelCriticidad.BAJA]: "bg-muted text-muted-foreground",
  [NivelCriticidad.MEDIA]: "bg-warning/15 text-warning",
  [NivelCriticidad.ALTA]: "bg-destructive/10 text-destructive",
  [NivelCriticidad.CRITICA]: "bg-destructive text-background",
};

// Classes used when a claim is under alert but the level did not arrive.
export const NIVEL_ALERTA_CLASES_SIN_NIVEL = "bg-warning/15 text-warning";

export interface ConAlertaClimatica {
  bajo_alerta_climatica: boolean;
  alerta_nivel: NivelCriticidad | null;
}

export function severidadAlerta(nivel: NivelCriticidad | null): number {
  return nivel ? SEVERIDAD[nivel] : 0;
}

/** Text of the chip: "Alerta climática: Crítica", or just the title with no level. */
export function textoBadgeAlerta(nivel: NivelCriticidad | null): string {
  return nivel ? `Alerta climática: ${NIVEL_ALERTA_LABEL[nivel]}` : "Alerta climática";
}

function pesoAlerta(fila: ConAlertaClimatica): number {
  // A claim under alert always outranks one that is not, even without a level.
  return fila.bajo_alerta_climatica ? 1 + severidadAlerta(fila.alerta_nivel) : 0;
}

/**
 * Puts claims under a weather alert first, most severe first. The sort is stable,
 * so claims with the same weight keep the order the server returned them in.
 */
export function ordenarPorAlerta<T extends ConAlertaClimatica>(filas: readonly T[]): T[] {
  return [...filas].sort((a, b) => pesoAlerta(b) - pesoAlerta(a));
}
