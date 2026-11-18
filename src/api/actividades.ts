import { request } from "./client";
import type { ActividadOut } from "./types";

/** Mass activities that still relate claims (staff only; citizens get 403). */
export function listarActividades(incluirFinalizadas = false): Promise<ActividadOut[]> {
  return request<ActividadOut[]>("/actividades", {
    query: { incluir_finalizadas: incluirFinalizadas ? true : undefined },
  });
}
