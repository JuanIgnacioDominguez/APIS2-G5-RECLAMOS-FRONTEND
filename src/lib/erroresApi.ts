/**
 * Human, stable error messages for the UI. We key off the backend's `code`
 * (RFC 7807 extension member) and the HTTP status, never the raw `detail` text,
 * so a wording change on the server never breaks what the citizen reads.
 *
 * Pure module: no React, no fetch. Tested directly.
 */

/** Sentinel code used by the api client when `fetch` itself fails (offline). */
export const CODIGO_RED = "red";

/** Messages for the backend's domain error codes (app/core/exceptions.py). */
const MENSAJE_POR_CODIGO: Record<string, string> = {
  reclamo_no_encontrado: "Ese reclamo no existe o fue eliminado.",
  transicion_invalida: "Ese cambio de estado no esta permitido desde el estado actual.",
  adhesion_duplicada: "Ya te sumaste a este reclamo.",
  adhesion_del_autor: "No podes sumarte a tu propio reclamo.",
  reclamo_cerrado: "El reclamo esta cerrado y no admite cambios.",
  validacion: "Revisa los datos del formulario, hay algo que no es valido.",
  conflicto: "La operacion no se pudo completar por un conflicto con el estado actual.",
  interno: "Algo fallo de nuestro lado, proba de nuevo en un rato.",
  [CODIGO_RED]: "No pudimos conectar con el servidor. Revisa tu conexion e intenta de nuevo.",
};

/** Fallback messages by HTTP status, when there is no known domain `code`. */
function mensajePorStatus(status: number): string | null {
  if (status === 403) return "No tenes permisos para ver esto.";
  if (status === 404) return "No encontramos lo que buscabas.";
  if (status >= 500) return "Algo fallo de nuestro lado, proba de nuevo en un rato.";
  return null;
}

interface DatosError {
  status?: number;
  code?: string;
}

/**
 * Friendly message for an API error, or `null` to let the caller fall back to
 * the raw backend text. 401 returns `null` on purpose: an expired session is
 * handled by redirecting to login (with its own notice), not by a message here.
 */
export function mensajeDeError({ status, code }: DatosError): string | null {
  if (code && MENSAJE_POR_CODIGO[code]) return MENSAJE_POR_CODIGO[code];
  if (status === 401) return null;
  if (status !== undefined) return mensajePorStatus(status);
  return null;
}

/** True when the failure is a network/offline error (no HTTP response). */
export function esErrorDeRed(code?: string, status?: number): boolean {
  return code === CODIGO_RED || status === 0;
}
