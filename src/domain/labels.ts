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
 * CityPass+ brand color keys, hex values. Every badge/marker/legend in the app
 * reads from this single map (see `COLOR_HEX` below) so a color never drifts
 * between screens. Deliberately no gray: every state and priority, including
 * "Recibido" and "Baja", carries a real brand color, never a neutral one.
 */
export const COLOR_HEX = {
  azulUrbano: "#2563a6",
  azulSuave: "#4f89d1",
  azulNoche: "#142430",
  ambar: "#d99838",
  verdeUrbano: "#4f8a72",
  rojoEmergencia: "#c83e4d",
} as const;
export type ColorKey = keyof typeof COLOR_HEX;

/** Brand color key per state, for badges, map markers and legends. */
export const ESTADO_COLOR: Record<EstadoReclamo, ColorKey> = {
  [EstadoReclamo.RECIBIDO]: "azulSuave",
  [EstadoReclamo.EN_REVISION]: "azulUrbano",
  [EstadoReclamo.ASIGNADO]: "azulUrbano",
  [EstadoReclamo.EN_PROCESO]: "ambar",
  [EstadoReclamo.RESUELTO]: "verdeUrbano",
  [EstadoReclamo.RECHAZADO]: "rojoEmergencia",
  [EstadoReclamo.CERRADO]: "azulNoche",
};

export const PRIORIDAD_LABEL: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "Baja",
  [PrioridadReclamo.MEDIA]: "Media",
  [PrioridadReclamo.ALTA]: "Alta",
  [PrioridadReclamo.CRITICA]: "Critica",
};

/** Low to critical reads as a calm-to-urgent ramp: green, blue, amber, red. */
export const PRIORIDAD_COLOR: Record<PrioridadReclamo, ColorKey> = {
  [PrioridadReclamo.BAJA]: "verdeUrbano",
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
