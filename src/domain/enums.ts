/**
 * The vocabulary of the claims domain.
 *
 * These values mirror the backend contract (`app/domain/enums.py`): they travel
 * over the REST API and inside event payloads, so a value must never drift from
 * the backend without versioning the contract.
 */

export const EstadoReclamo = {
  RECIBIDO: "RECIBIDO",
  EN_REVISION: "EN_REVISION",
  ASIGNADO: "ASIGNADO",
  EN_PROCESO: "EN_PROCESO",
  RESUELTO: "RESUELTO",
  RECHAZADO: "RECHAZADO",
  CERRADO: "CERRADO",
} as const;
export type EstadoReclamo = (typeof EstadoReclamo)[keyof typeof EstadoReclamo];

export const PrioridadReclamo = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  CRITICA: "CRITICA",
} as const;
export type PrioridadReclamo = (typeof PrioridadReclamo)[keyof typeof PrioridadReclamo];

export const CategoriaReclamo = {
  ALUMBRADO: "ALUMBRADO",
  BACHES: "BACHES",
  RESIDUOS: "RESIDUOS",
  ARBOLADO: "ARBOLADO",
  AGUA_CLOACAS: "AGUA_CLOACAS",
  TRANSITO: "TRANSITO",
  RUIDOS: "RUIDOS",
  ESPACIOS_PUBLICOS: "ESPACIOS_PUBLICOS",
  SEGURIDAD: "SEGURIDAD",
  OTROS: "OTROS",
} as const;
export type CategoriaReclamo = (typeof CategoriaReclamo)[keyof typeof CategoriaReclamo];

export const CanalOrigen = {
  APP: "APP",
  WEB: "WEB",
  TELEFONO: "TELEFONO",
  PRESENCIAL: "PRESENCIAL",
  EVENTO: "EVENTO",
} as const;
export type CanalOrigen = (typeof CanalOrigen)[keyof typeof CanalOrigen];

export const OrigenClasificacion = {
  CIUDADANO: "CIUDADANO",
  MODELO: "MODELO",
  OPERADOR: "OPERADOR",
} as const;
export type OrigenClasificacion = (typeof OrigenClasificacion)[keyof typeof OrigenClasificacion];

/** States that accept no further changes. */
export const ESTADOS_FINALES: ReadonlySet<EstadoReclamo> = new Set([
  EstadoReclamo.CERRADO,
  EstadoReclamo.RECHAZADO,
]);

/** All values of each enum, handy for building filters and selects. */
export const ESTADOS = Object.values(EstadoReclamo);
export const PRIORIDADES = Object.values(PrioridadReclamo);
export const CATEGORIAS = Object.values(CategoriaReclamo);
