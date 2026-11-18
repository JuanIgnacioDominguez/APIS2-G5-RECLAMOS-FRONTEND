import { ApiError } from "@/api/client";
import { CODIGO_RED } from "@/lib/erroresApi";

// Group 8 (Analytics) serves a self-contained HTML dashboard per module.
const ANALITICA_URL =
  import.meta.env.VITE_ANALITICA_URL ||
  "https://citypass-backend-prod-becqetepcjbqa8c7.brazilsouth-01.azurewebsites.net";

export const MODULO_ANALITICA = "reclamos";

function mensajePara(status: number): string {
  if (status === 401) return "Tu sesion no es valida para Analitica. Volve a ingresar.";
  if (status === 403) return "Tu usuario no tiene acceso al tablero de Reclamos.";
  return "Analitica no esta disponible por el momento.";
}

/**
 * Fetches the module's dashboard as HTML. The user's access token goes only in
 * the Authorization header (never in the URL) and the response is not cached:
 * it holds data only authorized users may see.
 */
export async function obtenerTableroAnalitica(
  token: string,
  signal?: AbortSignal,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${ANALITICA_URL}/embed/${MODULO_ANALITICA}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/html" },
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "No se pudo conectar con Analitica.", CODIGO_RED);
  }
  if (!response.ok) throw new ApiError(response.status, mensajePara(response.status));
  return response.text();
}
