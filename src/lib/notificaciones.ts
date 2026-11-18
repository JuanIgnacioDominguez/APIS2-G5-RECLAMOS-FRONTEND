import { REFRESCO_PANTALLA_MS } from "./refresco";

export const REFRESCO_NOTIFICACIONES_MS = REFRESCO_PANTALLA_MS;

export function esEndpointNoDisponible(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 404;
}
