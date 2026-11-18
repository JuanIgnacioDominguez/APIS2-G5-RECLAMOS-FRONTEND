/** Claims list filtered by one mass activity (staff). */
export function rutaReclamosDeActividad(id: string): string {
  return `/reclamos?actividad=${encodeURIComponent(id)}`;
}

const ETIQUETA_ESTADO: Record<string, string> = {
  CANCELADA: "Cancelada",
  SUSPENDIDA: "Suspendida",
};

/** Cancelled/suspended activities relate no new claims; any other state shows as usual. */
export function etiquetaEstadoActividad(estado: string): string | null {
  return ETIQUETA_ESTADO[estado.toUpperCase()] ?? null;
}
