import { describe, expect, it } from "vitest";

import type { ReclamoBandeja } from "@/api/types";
import {
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";
import {
  calcularKpisBandeja,
  crearCsvBandeja,
  crearHojaBandeja,
  crearJsonBandeja,
  filtrarBandeja,
  transicionesComunesBandeja,
} from "./bandejaTable";

function reclamo(
  id: string,
  titulo: string,
  estado: EstadoReclamo = EstadoReclamo.RECIBIDO,
): ReclamoBandeja {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.BACHES,
    origen_clasificacion: OrigenClasificacion.MODELO,
    prioridad: PrioridadReclamo.ALTA,
    estado,
    adhesiones_count: 3,
    created_at: "2026-09-24T12:00:00.000Z",
  };
}

describe("bandejaTable", () => {
  const filas = [
    reclamo("1", "Bache en la esquina"),
    reclamo("2", "Semáforo roto", EstadoReclamo.EN_REVISION),
  ];

  it("calcula los KPI de la bandeja", () => {
    expect(calcularKpisBandeja(filas, 7)).toEqual({
      entrantes: 7,
      recibidos: 1,
      enRevision: 1,
      clasificadosIa: 2,
      adhesiones: 6,
    });
  });

  it("busca en todos los campos visibles sin distinguir acentos", () => {
    expect(filtrarBandeja(filas, "SEMAFORO").map((fila) => fila.id)).toEqual(["2"]);
    expect(filtrarBandeja(filas, "en revision").map((fila) => fila.id)).toEqual(["2"]);
    expect(filtrarBandeja(filas, "3")).toHaveLength(2);
  });

  it("calcula solo las transiciones validas para toda la seleccion", () => {
    expect(transicionesComunesBandeja([filas[0]])).toEqual([
      EstadoReclamo.EN_REVISION,
      EstadoReclamo.ASIGNADO,
      EstadoReclamo.RECHAZADO,
    ]);
    expect(transicionesComunesBandeja(filas)).toEqual([
      EstadoReclamo.ASIGNADO,
      EstadoReclamo.RECHAZADO,
    ]);
    expect(transicionesComunesBandeja([filas[1]])).toEqual([
      EstadoReclamo.ASIGNADO,
      EstadoReclamo.RECHAZADO,
      EstadoReclamo.RECIBIDO,
    ]);
  });

  it("exporta CSV protegido contra formulas", () => {
    const csv = crearCsvBandeja([reclamo("1", "=CMD()")]);
    expect(csv).toContain("'=CMD()");
  });

  it("genera JSON y Excel con los datos visibles", () => {
    const json = JSON.parse(crearJsonBandeja([filas[0]])) as Array<{ id: string }>;
    const hoja = crearHojaBandeja([filas[0]]);

    expect(json[0]?.id).toBe("1");
    expect(hoja[0]?.[0]).toEqual({ value: "ID", fontWeight: "bold" });
    expect(hoja[1]?.[0]).toBe("1");
  });
});
