import type { ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";

export type TabReclamos = "todos" | "abiertos" | "en_proceso" | "resueltos";

export const TABS: { value: TabReclamos; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "abiertos", label: "Abiertos" },
  { value: "en_proceso", label: "En proceso" },
  { value: "resueltos", label: "Resueltos" },
];

const ABIERTOS = new Set<EstadoReclamo>([
  EstadoReclamo.RECIBIDO,
  EstadoReclamo.EN_REVISION,
  EstadoReclamo.ASIGNADO,
]);

const RESUELTOS = new Set<EstadoReclamo>([
  EstadoReclamo.RESUELTO,
  EstadoReclamo.CERRADO,
  EstadoReclamo.RECHAZADO,
]);

export function perteneceATab(estado: EstadoReclamo, tab: TabReclamos): boolean {
  switch (tab) {
    case "todos":
      return true;
    case "abiertos":
      return ABIERTOS.has(estado);
    case "en_proceso":
      return estado === EstadoReclamo.EN_PROCESO;
    case "resueltos":
      return RESUELTOS.has(estado);
  }
}

export function filtrarReclamos(
  items: ReclamoResumen[],
  tab: TabReclamos,
  texto: string,
  categoria: CategoriaReclamo | null = null,
): ReclamoResumen[] {
  const q = texto.trim().toLowerCase();
  return items.filter(
    (r) =>
      perteneceATab(r.estado, tab) &&
      (categoria === null || r.categoria === categoria) &&
      (q === "" || r.titulo.toLowerCase().includes(q)),
  );
}

export function contarPorTab(items: ReclamoResumen[]): Record<TabReclamos, number> {
  return {
    todos: items.length,
    abiertos: items.filter((r) => perteneceATab(r.estado, "abiertos")).length,
    en_proceso: items.filter((r) => perteneceATab(r.estado, "en_proceso")).length,
    resueltos: items.filter((r) => perteneceATab(r.estado, "resueltos")).length,
  };
}
