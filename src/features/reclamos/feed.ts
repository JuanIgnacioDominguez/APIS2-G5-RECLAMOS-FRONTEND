import type { ReclamoResumen } from "@/api/types";
import type { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";

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

export function barriosDisponibles(items: ReclamoResumen[]): string[] {
  const barrios = new Set<string>();
  for (const r of items) {
    const b = r.barrio?.trim();
    if (b) barrios.add(b);
  }
  return [...barrios].sort((a, b) => a.localeCompare(b, "es"));
}

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
