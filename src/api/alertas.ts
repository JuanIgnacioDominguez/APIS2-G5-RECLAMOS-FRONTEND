import { request } from "./client";
import type { AlertaClimaticaOut } from "./types";

/** Weather alerts in force right now (staff only; citizens get 403). */
export function listarAlertasActivas(): Promise<AlertaClimaticaOut[]> {
  return request<AlertaClimaticaOut[]>("/alertas-climaticas/activas");
}
