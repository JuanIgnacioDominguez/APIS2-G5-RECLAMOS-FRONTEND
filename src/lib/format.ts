/** Small presentation helpers shared across the Reclamos UI. */

/** Human date like "19 ago 2026, 15:45" from an ISO string. */
export function formatFecha(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Relative distance like "hace 3 h" / "hace 2 dias". */
export function haceCuanto(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const segundos = Math.round((now.getTime() - date.getTime()) / 1000);
  if (segundos < 60) return "hace instantes";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "hace 1 dia" : `hace ${dias} dias`;
}

/** A confidence in [0,1] as an integer percentage string. */
export function formatConfianza(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  const acotado = Math.min(1, Math.max(0, valor));
  return `${Math.round(acotado * 100)}%`;
}

/** Short id for display: "#a1b2c3d4" from a UUID. */
export function idCorto(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 8)}`;
}
