import { ESTADOS_RESUELTOS } from "@/domain/enums";

import { request } from "./client";
import type {
  BusquedaSimilares,
  CambioEstado,
  ComentarioOut,
  Estadisticas,
  FiltroReclamos,
  HistorialOut,
  Page,
  ReclamoBandeja,
  ReclamoCrear,
  ReclamoDetalle,
  ReclamoListado,
  ReclamoOut,
  ReclamoSimilar,
  ReclasificacionPedido,
  SugerenciaClasificacion,
} from "./types";

export function listarReclamos(filtro: FiltroReclamos = {}): Promise<Page<ReclamoListado>> {
  return request<Page<ReclamoListado>>("/reclamos", { query: { ...filtro } });
}

export async function contarResueltos(): Promise<number> {
  const paginas = await Promise.all(
    [...ESTADOS_RESUELTOS].map((estado) => listarReclamos({ estado, page: 1, size: 1 })),
  );
  return paginas.reduce((total, pagina) => total + pagina.total, 0);
}

export function obtenerReclamo(id: string): Promise<ReclamoDetalle> {
  return request<ReclamoDetalle>(`/reclamos/${id}`);
}

export function crearReclamo(datos: ReclamoCrear): Promise<ReclamoOut> {
  return request<ReclamoOut>("/reclamos", { method: "POST", body: datos });
}

export function buscarSimilares(datos: BusquedaSimilares): Promise<ReclamoSimilar[]> {
  return request<ReclamoSimilar[]>("/reclamos/similares", { method: "POST", body: datos });
}

export function similaresDe(id: string): Promise<ReclamoSimilar[]> {
  return request<ReclamoSimilar[]>(`/reclamos/${id}/similares`);
}

export function cambiarEstado(id: string, cambio: CambioEstado): Promise<ReclamoOut> {
  return request<ReclamoOut>(`/reclamos/${id}/estado`, { method: "PATCH", body: cambio });
}

export function bandeja(page = 1, size = 20): Promise<Page<ReclamoBandeja>> {
  return request<Page<ReclamoBandeja>>("/reclamos/bandeja", { query: { page, size } });
}

export function reclasificar(id: string, cambio: ReclasificacionPedido): Promise<ReclamoOut> {
  return request<ReclamoOut>(`/reclamos/${id}/clasificacion`, { method: "PATCH", body: cambio });
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

export function listarComentarios(id: string): Promise<ComentarioOut[]> {
  return request<ComentarioOut[]>(`/reclamos/${id}/comentarios`);
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
