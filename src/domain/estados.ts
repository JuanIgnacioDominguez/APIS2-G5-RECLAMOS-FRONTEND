import { EstadoReclamo, PrioridadReclamo, ESTADOS_FINALES } from "./enums";

export const TRANSICIONES_VALIDAS: Record<EstadoReclamo, ReadonlyArray<EstadoReclamo>> = {
  [EstadoReclamo.RECIBIDO]: [
    EstadoReclamo.EN_REVISION,
    EstadoReclamo.ASIGNADO,
    EstadoReclamo.RECHAZADO,
  ],
  [EstadoReclamo.EN_REVISION]: [
    EstadoReclamo.ASIGNADO,
    EstadoReclamo.RECHAZADO,
    EstadoReclamo.RECIBIDO,
  ],
  [EstadoReclamo.ASIGNADO]: [EstadoReclamo.EN_PROCESO, EstadoReclamo.RECHAZADO],
  [EstadoReclamo.EN_PROCESO]: [EstadoReclamo.RESUELTO, EstadoReclamo.ASIGNADO],
  [EstadoReclamo.RESUELTO]: [EstadoReclamo.CERRADO, EstadoReclamo.EN_PROCESO],
  [EstadoReclamo.RECHAZADO]: [],
  [EstadoReclamo.CERRADO]: [],
};

export const ORDEN_PRIORIDAD: Record<PrioridadReclamo, number> = {
  [PrioridadReclamo.BAJA]: 0,
  [PrioridadReclamo.MEDIA]: 1,
  [PrioridadReclamo.ALTA]: 2,
  [PrioridadReclamo.CRITICA]: 3,
};

export function transicionesDesde(actual: EstadoReclamo): ReadonlyArray<EstadoReclamo> {
  return TRANSICIONES_VALIDAS[actual] ?? [];
}

export function puedeTransicionar(actual: EstadoReclamo, nuevo: EstadoReclamo): boolean {
  return transicionesDesde(actual).includes(nuevo);
}

export function esFinal(estado: EstadoReclamo): boolean {
  return ESTADOS_FINALES.has(estado);
}

export function escalar(actual: PrioridadReclamo, minima: PrioridadReclamo): PrioridadReclamo {
  return ORDEN_PRIORIDAD[actual] >= ORDEN_PRIORIDAD[minima] ? actual : minima;
}
