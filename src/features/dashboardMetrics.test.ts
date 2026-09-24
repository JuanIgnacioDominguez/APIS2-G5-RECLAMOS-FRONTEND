import { describe, expect, it } from "vitest";

import type { Estadisticas, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  cantidadPorEstado,
  resumenDesdeEstadisticas,
  resumenDesdeReclamos,
} from "./dashboardMetrics";

const estadisticas: Estadisticas = {
  total: 50,
  por_estado: [
    { clave: EstadoReclamo.RECIBIDO, cantidad: 10 },
    { clave: EstadoReclamo.EN_REVISION, cantidad: 5 },
    { clave: EstadoReclamo.RESUELTO, cantidad: 20 },
  ],
  por_categoria: [
    { clave: CategoriaReclamo.ALUMBRADO, cantidad: 30 },
    { clave: CategoriaReclamo.BACHES, cantidad: 20 },
  ],
  por_prioridad: [
    { clave: PrioridadReclamo.CRITICA, cantidad: 4 },
    { clave: PrioridadReclamo.BAJA, cantidad: 46 },
  ],
  tiempo_resolucion_horas_promedio: 18,
};

function reclamo(
  id: string,
  estado: EstadoReclamo,
  categoria: CategoriaReclamo,
  prioridad: PrioridadReclamo,
): ReclamoResumen {
  return {
    id,
    titulo: `Reclamo ${id}`,
    categoria,
    prioridad,
    estado,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: "2026-09-20T12:00:00Z",
  };
}

describe("dashboardMetrics", () => {
  it("convierte las estadisticas globales en distribuciones completas", () => {
    const resumen = resumenDesdeEstadisticas(estadisticas);

    expect(resumen.total).toBe(50);
    expect(cantidadPorEstado(resumen, EstadoReclamo.RECIBIDO)).toBe(10);
    expect(cantidadPorEstado(resumen, EstadoReclamo.EN_REVISION)).toBe(5);
    expect(cantidadPorEstado(resumen, EstadoReclamo.RESUELTO)).toBe(20);
    expect(
      resumen.por_categoria.find((item) => item.clave === CategoriaReclamo.ALUMBRADO)?.porcentaje,
    ).toBe(60);
    expect(
      resumen.por_prioridad.find((item) => item.clave === PrioridadReclamo.CRITICA)?.cantidad,
    ).toBe(4);
  });

  it("deriva un resumen coherente para la muestra reciente", () => {
    const resumen = resumenDesdeReclamos([
      reclamo("1", EstadoReclamo.RECIBIDO, CategoriaReclamo.BACHES, PrioridadReclamo.ALTA),
      reclamo("2", EstadoReclamo.EN_REVISION, CategoriaReclamo.BACHES, PrioridadReclamo.MEDIA),
      reclamo("3", EstadoReclamo.RESUELTO, CategoriaReclamo.ALUMBRADO, PrioridadReclamo.BAJA),
    ]);

    expect(resumen.total).toBe(3);
    expect(cantidadPorEstado(resumen, EstadoReclamo.RECIBIDO)).toBe(1);
    expect(cantidadPorEstado(resumen, EstadoReclamo.EN_REVISION)).toBe(1);
    expect(
      resumen.por_categoria.find((item) => item.clave === CategoriaReclamo.BACHES)?.cantidad,
    ).toBe(2);
  });
});
