import { ApiError } from "@/api/client";
import { CODIGO_RED } from "@/lib/erroresApi";

/**
 * Analytics (Group 8) goes through our own backend: it opens a short session,
 * sets an HttpOnly cookie and serves the dashboard HTML at this path. The path
 * is relative on purpose: the hosting must proxy it to the API so the iframe
 * and the cookie stay on the frontend's own origin (CORS does not replace that).
 */
export const RUTA_ANALITICA = "/api/v1/admin/analitica";

export interface SesionAnalitica {
  usuario_id: string;
  expires_at: string;
  estado: string;
  iframe_url: string;
  csrf_token: string;
}

function mensajePara(status: number): string {
  switch (status) {
    case 401:
      return "Tu sesion no es valida para Analitica. Volve a ingresar.";
    case 403:
      return "Tu usuario no tiene acceso al tablero de Reclamos.";
    case 404:
      return "El tablero de Analitica todavia no esta habilitado.";
    case 409:
      return "Hay otra sesion de Analitica abierta con otro usuario. Recarga la pagina.";
    case 502:
    case 503:
    case 504:
      return "Analitica no esta disponible por el momento. Proba de nuevo en unos minutos.";
    default:
      return "No se pudo abrir el tablero de Analitica.";
  }
}

async function llamar(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(path, { ...init, credentials: "same-origin", cache: "no-store" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "No se pudo conectar con Analitica.", CODIGO_RED);
  }
}

/** Opens (or rotates) the dashboard session. The token only travels in the header. */
export async function iniciarSesionAnalitica(
  token: string,
  signal?: AbortSignal,
): Promise<SesionAnalitica> {
  const response = await llamar(`${RUTA_ANALITICA}/sesion`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
    signal,
  });
  if (!response.ok) throw new ApiError(response.status, mensajePara(response.status));
  return (await response.json()) as SesionAnalitica;
}

/** Revokes the session on the server; the CSRF token comes from the POST. */
export async function revocarSesionAnalitica(csrf: string): Promise<void> {
  const response = await llamar(`${RUTA_ANALITICA}/sesion`, {
    method: "DELETE",
    headers: { "X-CSRF-Token": csrf },
  });
  if (!response.ok)
    throw new ApiError(response.status, "No se pudo cerrar la sesion de Analitica.");
}
