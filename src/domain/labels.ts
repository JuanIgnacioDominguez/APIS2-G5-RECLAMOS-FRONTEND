/**
 * Human-facing labels and colors for the domain enums.
 *
 * Domain identifiers stay in Spanish (the municipal vocabulary of the rubric),
 * and so does everything the citizen reads on screen.
 */

import { CategoriaReclamo, EstadoReclamo, OrigenClasificacion, PrioridadReclamo } from "./enums";

export const ESTADO_LABEL: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "Recibido",
  [EstadoReclamo.EN_REVISION]: "En revision",
  [EstadoReclamo.ASIGNADO]: "Asignado",
  [EstadoReclamo.EN_PROCESO]: "En proceso",
  [EstadoReclamo.RESUELTO]: "Resuelto",
  [EstadoReclamo.RECHAZADO]: "Rechazado",
  [EstadoReclamo.CERRADO]: "Cerrado",
};

/**
 * Concrete status fills shared by DOM badges and canvas map markers. Text and
 * badge foregrounds use the adjacent theme-aware token maps instead.
 */
export const ESTADO_HEX: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "#2563eb", // bright blue: just arrived
  [EstadoReclamo.EN_REVISION]: "#d9a406", // deep sunflower yellow: being triaged
  [EstadoReclamo.ASIGNADO]: "#0891b2", // cyan: has an owner (kept apart from blue)
  [EstadoReclamo.EN_PROCESO]: "#ea580c", // orange: work in progress
  [EstadoReclamo.RESUELTO]: "#16a34a", // green: solved
  [EstadoReclamo.RECHAZADO]: "#dc2626", // red: rejected
  [EstadoReclamo.CERRADO]: "#64748b", // slate: closed / archived
};

export const ESTADO_ON_COLOR: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "var(--status-received-on)",
  [EstadoReclamo.EN_REVISION]: "var(--status-review-on)",
  [EstadoReclamo.ASIGNADO]: "var(--status-assigned-on)",
  [EstadoReclamo.EN_PROCESO]: "var(--status-progress-on)",
  [EstadoReclamo.RESUELTO]: "var(--status-resolved-on)",
  [EstadoReclamo.RECHAZADO]: "var(--status-rejected-on)",
  [EstadoReclamo.CERRADO]: "var(--status-closed-on)",
};

export const ESTADO_TEXT_COLOR: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "var(--status-received-text)",
  [EstadoReclamo.EN_REVISION]: "var(--status-review-text)",
  [EstadoReclamo.ASIGNADO]: "var(--status-assigned-text)",
  [EstadoReclamo.EN_PROCESO]: "var(--status-progress-text)",
  [EstadoReclamo.RESUELTO]: "var(--status-resolved-text)",
  [EstadoReclamo.RECHAZADO]: "var(--status-rejected-text)",
  [EstadoReclamo.CERRADO]: "var(--status-closed-text)",
};

export const PRIORIDAD_LABEL: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "Baja",
  [PrioridadReclamo.MEDIA]: "Media",
  [PrioridadReclamo.ALTA]: "Alta",
  [PrioridadReclamo.CRITICA]: "Critica",
};

/** Theme-aware priority colors shared by labels, icons and charts. */
export const PRIORIDAD_HEX: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "var(--priority-low)",
  [PrioridadReclamo.MEDIA]: "var(--priority-medium)",
  [PrioridadReclamo.ALTA]: "var(--priority-high)",
  [PrioridadReclamo.CRITICA]: "var(--priority-critical)",
};

/**
 * Area suggested per category, used only to prefill the free-text
 * "area responsable" field when staff assigns a claim (there is no area
 * catalog in the backend, so this is a frontend-only heuristic).
 */
export const AREA_SUGERIDA: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.ALUMBRADO]: "Alumbrado Publico",
  [CategoriaReclamo.BACHES]: "Vialidad y Mantenimiento Vial",
  [CategoriaReclamo.RESIDUOS]: "Higiene Urbana",
  [CategoriaReclamo.ARBOLADO]: "Arbolado y Espacios Verdes",
  [CategoriaReclamo.AGUA_CLOACAS]: "Aguas y Saneamiento",
  [CategoriaReclamo.TRANSITO]: "Transito y Transporte",
  [CategoriaReclamo.RUIDOS]: "Control Urbano",
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: "Espacios Publicos",
  [CategoriaReclamo.SEGURIDAD]: "Seguridad Ciudadana",
  [CategoriaReclamo.OTROS]: "Mesa de Entradas",
};

/** Theme-aware category colors shared by labels, icons and charts. */
export const CATEGORIA_HEX: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.ALUMBRADO]: "var(--category-alumbrado)",
  [CategoriaReclamo.BACHES]: "var(--category-baches)",
  [CategoriaReclamo.RESIDUOS]: "var(--category-residuos)",
  [CategoriaReclamo.ARBOLADO]: "var(--category-arbolado)",
  [CategoriaReclamo.AGUA_CLOACAS]: "var(--category-agua)",
  [CategoriaReclamo.TRANSITO]: "var(--category-transito)",
  [CategoriaReclamo.RUIDOS]: "var(--category-ruidos)",
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: "var(--category-espacios)",
  [CategoriaReclamo.SEGURIDAD]: "var(--category-seguridad)",
  [CategoriaReclamo.OTROS]: "var(--category-otros)",
};

export const CATEGORIA_LABEL: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.ALUMBRADO]: "Alumbrado",
  [CategoriaReclamo.BACHES]: "Baches",
  [CategoriaReclamo.RESIDUOS]: "Residuos",
  [CategoriaReclamo.ARBOLADO]: "Arbolado",
  [CategoriaReclamo.AGUA_CLOACAS]: "Agua y cloacas",
  [CategoriaReclamo.TRANSITO]: "Transito",
  [CategoriaReclamo.RUIDOS]: "Ruidos",
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: "Espacios publicos",
  [CategoriaReclamo.SEGURIDAD]: "Seguridad",
  [CategoriaReclamo.OTROS]: "Otros",
};

/** Who decided the claim's category/priority. */
export const ORIGEN_LABEL: Record<OrigenClasificacion, string> = {
  [OrigenClasificacion.CIUDADANO]: "Ciudadano",
  [OrigenClasificacion.MODELO]: "IA",
  [OrigenClasificacion.OPERADOR]: "Operador",
};

/** Options ready for a `Select` (value + label). */
export function opcionesEstado() {
  return Object.entries(ESTADO_LABEL).map(([value, label]) => ({ value, label }));
}

export function opcionesPrioridad() {
  return Object.entries(PRIORIDAD_LABEL).map(([value, label]) => ({ value, label }));
}

export function opcionesCategoria() {
  return Object.entries(CATEGORIA_LABEL).map(([value, label]) => ({ value, label }));
}
