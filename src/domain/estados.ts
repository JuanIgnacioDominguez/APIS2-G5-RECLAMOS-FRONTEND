/**
 * The claim's state machine, mirrored from the backend (`app/domain/enums.py`).
 *
 * The frontend uses it to only offer transitions the backend will accept, so an
 * operator never sees a state change the API is going to reject with 409.
 */

import { EstadoReclamo, PrioridadReclamo, ESTADOS_FINALES } from "./enums";

/** Any transition outside this map is rejected by the backend. */
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

/** Ranking so priorities can be compared and escalated. */
export const ORDEN_PRIORIDAD: Record<PrioridadReclamo, number> = {
  [PrioridadReclamo.BAJA]: 0,
  [PrioridadReclamo.MEDIA]: 1,
  [PrioridadReclamo.ALTA]: 2,
  [PrioridadReclamo.CRITICA]: 3,
};

/** States the given state can move to. */
export function transicionesDesde(actual: EstadoReclamo): ReadonlyArray<EstadoReclamo> {
  return TRANSICIONES_VALIDAS[actual] ?? [];
}

/** Whether `nuevo` is a valid next state from `actual`. */
export function puedeTransicionar(actual: EstadoReclamo, nuevo: EstadoReclamo): boolean {
  return transicionesDesde(actual).includes(nuevo);
}

/** Whether the claim is in a terminal state and accepts no more changes. */
export function esFinal(estado: EstadoReclamo): boolean {
  return ESTADOS_FINALES.has(estado);
}

/** Return the higher of `actual` and `minima`; never lowers a priority. */
export function escalar(actual: PrioridadReclamo, minima: PrioridadReclamo): PrioridadReclamo {
  return ORDEN_PRIORIDAD[actual] >= ORDEN_PRIORIDAD[minima] ? actual : minima;
}
