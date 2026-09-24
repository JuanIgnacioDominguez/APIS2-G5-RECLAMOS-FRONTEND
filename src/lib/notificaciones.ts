export const REFRESCO_NOTIFICACIONES_MS = 15_000;

export function esEndpointNoDisponible(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 404;
}
