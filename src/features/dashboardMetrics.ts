import type { Estadisticas, ReclamoResumen } from "@/api/types";
import { CATEGORIAS, ESTADOS, PRIORIDADES } from "@/domain/enums";
import {
  CATEGORIA_HEX,
  CATEGORIA_LABEL,
  ESTADO_HEX,
  ESTADO_LABEL,
  PRIORIDAD_HEX,
  PRIORIDAD_LABEL,
} from "@/domain/labels";

export interface DistribucionDashboard {
  clave: string;
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface ResumenDashboard {
  total: number;
  por_estado: DistribucionDashboard[];
  por_categoria: DistribucionDashboard[];
  por_prioridad: DistribucionDashboard[];
}

function conteos(items: { clave: string; cantidad: number }[]): Map<string, number> {
  return new Map(items.map((item) => [item.clave, item.cantidad]));
}

function porcentaje(cantidad: number, total: number): number {
  return total === 0 ? 0 : (cantidad / total) * 100;
}

function resumenDesdeConteos(
  total: number,
  porEstado: Map<string, number>,
  porCategoria: Map<string, number>,
  porPrioridad: Map<string, number>,
): ResumenDashboard {
  return {
    total,
    por_estado: ESTADOS.map((clave) => ({
      clave,
      etiqueta: ESTADO_LABEL[clave],
      cantidad: porEstado.get(clave) ?? 0,
      porcentaje: porcentaje(porEstado.get(clave) ?? 0, total),
      color: ESTADO_HEX[clave],
    })),
    por_categoria: CATEGORIAS.map((clave) => ({
      clave,
      etiqueta: CATEGORIA_LABEL[clave],
      cantidad: porCategoria.get(clave) ?? 0,
      porcentaje: porcentaje(porCategoria.get(clave) ?? 0, total),
      color: CATEGORIA_HEX[clave],
    })),
    por_prioridad: PRIORIDADES.map((clave) => ({
      clave,
      etiqueta: PRIORIDAD_LABEL[clave],
      cantidad: porPrioridad.get(clave) ?? 0,
      porcentaje: porcentaje(porPrioridad.get(clave) ?? 0, total),
      color: PRIORIDAD_HEX[clave],
    })),
  };
}

export function resumenDesdeEstadisticas(estadisticas: Estadisticas): ResumenDashboard {
  return resumenDesdeConteos(
    estadisticas.total,
    conteos(estadisticas.por_estado),
    conteos(estadisticas.por_categoria),
    conteos(estadisticas.por_prioridad),
  );
}

function contarLista(
  items: ReclamoResumen[],
  selector: (reclamo: ReclamoResumen) => string,
): Map<string, number> {
  const resultado = new Map<string, number>();
  for (const reclamo of items) {
    const clave = selector(reclamo);
    resultado.set(clave, (resultado.get(clave) ?? 0) + 1);
  }
  return resultado;
}

export function resumenDesdeReclamos(items: ReclamoResumen[]): ResumenDashboard {
  return resumenDesdeConteos(
    items.length,
    contarLista(items, (reclamo) => reclamo.estado),
    contarLista(items, (reclamo) => reclamo.categoria),
    contarLista(items, (reclamo) => reclamo.prioridad),
  );
}

export function cantidadPorEstado(resumen: ResumenDashboard, estado: string): number {
  return resumen.por_estado.find((item) => item.clave === estado)?.cantidad ?? 0;
}
