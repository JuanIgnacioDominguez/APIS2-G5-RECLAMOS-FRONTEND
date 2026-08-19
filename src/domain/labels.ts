/**
 * Human-facing labels and colors for the domain enums.
 *
 * Domain identifiers stay in Spanish (the municipal vocabulary of the rubric),
 * and so does everything the citizen reads on screen. Colors map to the Mantine
 * theme palette (see `src/theme/theme.ts`).
 */

import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "./enums";

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

/** Options ready for a Mantine `Select` (value + label). */
export function opcionesEstado() {
  return Object.entries(ESTADO_LABEL).map(([value, label]) => ({ value, label }));
}

export function opcionesPrioridad() {
  return Object.entries(PRIORIDAD_LABEL).map(([value, label]) => ({ value, label }));
}

export function opcionesCategoria() {
  return Object.entries(CATEGORIA_LABEL).map(([value, label]) => ({ value, label }));
}
