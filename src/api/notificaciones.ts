import { request } from "./client";
import type {
  ConteoNotificaciones,
  FiltroNotificaciones,
  Notificacion,
  PaginaNotificaciones,
  ResultadoMarcarTodas,
} from "./types";

export function listarNotificaciones(
  filtro: FiltroNotificaciones = {},
): Promise<PaginaNotificaciones> {
  return request<PaginaNotificaciones>("/notificaciones", { query: { ...filtro } });
}

export function contarNotificaciones(): Promise<ConteoNotificaciones> {
  return request<ConteoNotificaciones>("/notificaciones/conteo");
}

export function marcarNotificacionLeida(id: string): Promise<Notificacion> {
  return request<Notificacion>(`/notificaciones/${id}/leer`, { method: "PATCH" });
}

export function marcarTodasNotificacionesLeidas(): Promise<ResultadoMarcarTodas> {
  return request<ResultadoMarcarTodas>("/notificaciones/leer-todas", { method: "POST" });
}
