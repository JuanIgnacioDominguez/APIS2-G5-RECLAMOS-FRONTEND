import type { AlertaClimaticaOut } from "@/api/types";
import { severidadAlerta } from "./nivelAlerta";

/** Pure helpers for the staff panel of weather alerts in force. */

const MAX_BARRIOS_VISIBLES = 3;
const ZONA_BUENOS_AIRES = "America/Argentina/Buenos_Aires";
const PALABRAS_MENORES = new Set(["de", "del", "la", "las", "los", "y"]);

/** "TORMENTA_FUERTE" -> "Tormenta fuerte". */
export function formatearFenomeno(fenomeno: string): string {
  const texto = fenomeno.replace(/_/g, " ").trim().toLowerCase();
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "Fenómeno sin especificar";
}

/** "BARRIO DEMO ALERTA" -> "Barrio Demo Alerta", keeping "de", "del"... in lower case. */
export function nombreBarrio(barrio: string): string {
  return barrio
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palabra, i) =>
      i > 0 && PALABRAS_MENORES.has(palabra)
        ? palabra
        : palabra.charAt(0).toUpperCase() + palabra.slice(1),
    )
    .join(" ");
}

/** First few neighbourhoods plus how many were left out. */
export function resumirBarrios(barrios: readonly string[]): {
  visibles: string[];
  restantes: number;
} {
  const visibles = barrios.slice(0, MAX_BARRIOS_VISIBLES).map(nombreBarrio);
  return { visibles, restantes: Math.max(0, barrios.length - visibles.length) };
}

/** End of the alert window in Buenos Aires time, e.g. "20/11 13:07". */
export function formatHasta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "-";
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("es-AR", {
      timeZone: ZONA_BUENOS_AIRES,
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value]),
  );
  return `${partes.day}/${partes.month} ${partes.hour}:${partes.minute}`;
}

/** Most severe first; between equals, the one that ends sooner goes first. */
export function ordenarAlertas(alertas: readonly AlertaClimaticaOut[]): AlertaClimaticaOut[] {
  return [...alertas].sort(
    (a, b) =>
      severidadAlerta(b.nivel) - severidadAlerta(a.nivel) ||
      new Date(a.vigencia_hasta).getTime() - new Date(b.vigencia_hasta).getTime(),
  );
}
