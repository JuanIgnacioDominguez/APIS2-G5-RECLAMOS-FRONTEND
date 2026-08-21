/** Typed endpoints of the Reclamos module. Mirrors `app/api/v1/reclamos.py`. */

import { request } from "./client";
import type {
  CambioEstado,
  ComentarioOut,
  Estadisticas,
  FiltroReclamos,
  HistorialOut,
  Page,
  ReclamoCrear,
  ReclamoDetalle,
  ReclamoOut,
  ReclamoResumen,
  SugerenciaClasificacion,
} from "./types";

export function listarReclamos(filtro: FiltroReclamos = {}): Promise<Page<ReclamoResumen>> {
  return request<Page<ReclamoResumen>>("/reclamos", { query: { ...filtro } });
}

export function obtenerReclamo(id: string): Promise<ReclamoDetalle> {
  return request<ReclamoDetalle>(`/reclamos/${id}`);
}

export function crearReclamo(datos: ReclamoCrear): Promise<ReclamoOut> {
  return request<ReclamoOut>("/reclamos", { method: "POST", body: datos });
}

export function cambiarEstado(id: string, cambio: CambioEstado): Promise<ReclamoOut> {
  return request<ReclamoOut>(`/reclamos/${id}/estado`, { method: "PATCH", body: cambio });
}

export function sugerirClasificacion(
  titulo: string,
  descripcion: string,
): Promise<SugerenciaClasificacion> {
  return request<SugerenciaClasificacion>("/reclamos/clasificacion", {
    method: "POST",
    body: { titulo, descripcion },
  });
}

export function comentar(id: string, texto: string): Promise<ComentarioOut> {
  return request<ComentarioOut>(`/reclamos/${id}/comentarios`, {
    method: "POST",
    body: { texto },
  });
}

export function adherir(id: string): Promise<{ reclamo_id: string; adhesiones_count: number }> {
  return request(`/reclamos/${id}/adhesiones`, { method: "POST" });
}

export function historial(id: string): Promise<HistorialOut[]> {
  return request<HistorialOut[]>(`/reclamos/${id}/historial`);
}

export function estadisticas(): Promise<Estadisticas> {
  return request<Estadisticas>("/reclamos/estadisticas");
}
