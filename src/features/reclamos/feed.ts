/**
 * Pure helpers for the public claims feed (US-06/US-07): the distinct
 * neighbourhoods available as a filter, and the category/neighbourhood/status
 * filtering plus newest-first ordering. Kept out of the JSX so it is unit-tested.
 */

import type { ReclamoResumen } from "@/api/types";
import type { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";

/** Sort orders the feed can show. Mirrors the subset of the backend's `orden`
 * query param that a `ReclamoResumen` (the lightweight list projection) can
 * sort by on the client: it has no `updated_at`, so "actualizados" is
 * server-only and not offered here. */
export type OrdenFeed = "recientes" | "antiguos" | "adhesiones";

export interface FiltrosFeed {
  categoria: CategoriaReclamo | null;
  barrio: string | null;
  estado: EstadoReclamo | null;
  orden?: OrdenFeed;
}

const COMPARADORES: Record<OrdenFeed, (a: ReclamoResumen, b: ReclamoResumen) => number> = {
  recientes: (a, b) => b.created_at.localeCompare(a.created_at),
  antiguos: (a, b) => a.created_at.localeCompare(b.created_at),
  adhesiones: (a, b) => b.adhesiones_count - a.adhesiones_count,
};

/** Distinct, alphabetically sorted neighbourhoods present in the feed. */
export function barriosDisponibles(items: ReclamoResumen[]): string[] {
  const barrios = new Set<string>();
  for (const r of items) {
    const b = r.barrio?.trim();
    if (b) barrios.add(b);
  }
  return [...barrios].sort((a, b) => a.localeCompare(b, "es"));
}

/** Filter by category, neighbourhood and status; sorted newest first by default. */
export function filtrarFeed(items: ReclamoResumen[], filtros: FiltrosFeed): ReclamoResumen[] {
  return items
    .filter(
      (r) =>
        (filtros.categoria === null || r.categoria === filtros.categoria) &&
        (filtros.barrio === null || r.barrio === filtros.barrio) &&
        (filtros.estado === null || r.estado === filtros.estado),
    )
    .sort(COMPARADORES[filtros.orden ?? "recientes"]);
}
