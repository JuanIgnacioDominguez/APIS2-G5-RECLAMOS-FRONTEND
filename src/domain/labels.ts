/**
 * Human-facing labels and colors for the domain enums.
 *
 * Domain identifiers stay in Spanish (the municipal vocabulary of the rubric),
 * and so does everything the citizen reads on screen. Colors map to the Mantine
 * theme palette (see `src/theme/theme.ts`).
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

/** Mantine color key per state, for badges and timelines. */
export const ESTADO_COLOR: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "gray",
  [EstadoReclamo.EN_REVISION]: "azulUrbano",
  [EstadoReclamo.ASIGNADO]: "azulUrbano",
  [EstadoReclamo.EN_PROCESO]: "ambar",
  [EstadoReclamo.RESUELTO]: "verdeUrbano",
  [EstadoReclamo.RECHAZADO]: "rojoEmergencia",
  [EstadoReclamo.CERRADO]: "gray",
};

export const PRIORIDAD_LABEL: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "Baja",
  [PrioridadReclamo.MEDIA]: "Media",
  [PrioridadReclamo.ALTA]: "Alta",
  [PrioridadReclamo.CRITICA]: "Critica",
};

export const PRIORIDAD_COLOR: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "gray",
  [PrioridadReclamo.MEDIA]: "azulUrbano",
  [PrioridadReclamo.ALTA]: "ambar",
  [PrioridadReclamo.CRITICA]: "rojoEmergencia",
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
