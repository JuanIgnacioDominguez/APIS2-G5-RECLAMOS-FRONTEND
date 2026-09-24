import Papa from "papaparse";
import type { Row } from "write-excel-file/browser";

import type { ReclamoBandeja } from "@/api/types";
import { EstadoReclamo, OrigenClasificacion } from "@/domain/enums";
import { transicionesDesde } from "@/domain/estados";
import { CATEGORIA_LABEL, ESTADO_LABEL, ORIGEN_LABEL, PRIORIDAD_LABEL } from "@/domain/labels";

export interface FilaBandejaExport {
  id: string;
  titulo: string;
  categoria: string;
  prioridad: string;
  estado: string;
  origen: string;
  adhesiones: number;
  ingreso: string;
}

export interface KpisBandeja {
  entrantes: number;
  recibidos: number;
  enRevision: number;
  clasificadosIa: number;
  adhesiones: number;
}

export function calcularKpisBandeja(
  filas: readonly ReclamoBandeja[],
  total = filas.length,
): KpisBandeja {
  return {
    entrantes: total,
    recibidos: filas.filter((fila) => fila.estado === EstadoReclamo.RECIBIDO).length,
    enRevision: filas.filter((fila) => fila.estado === EstadoReclamo.EN_REVISION).length,
    clasificadosIa: filas.filter((fila) => fila.origen_clasificacion === OrigenClasificacion.MODELO)
      .length,
    adhesiones: filas.reduce((total, fila) => total + fila.adhesiones_count, 0),
  };
}

function normalizar(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarBandeja(
  filas: readonly ReclamoBandeja[],
  busqueda: string,
): ReclamoBandeja[] {
  const query = normalizar(busqueda.trim());
  if (!query) return [...filas];

  return filas.filter((fila) =>
    [
      fila.id,
      fila.titulo,
      CATEGORIA_LABEL[fila.categoria],
      PRIORIDAD_LABEL[fila.prioridad],
      ESTADO_LABEL[fila.estado],
      ORIGEN_LABEL[fila.origen_clasificacion],
      String(fila.adhesiones_count),
      fila.created_at,
    ].some((valor) => normalizar(valor).includes(query)),
  );
}

export function transicionesComunesBandeja(filas: readonly ReclamoBandeja[]): EstadoReclamo[] {
  const [primera, ...resto] = filas;
  if (!primera) return [];

  return transicionesDesde(primera.estado).filter((estado) =>
    resto.every((fila) => transicionesDesde(fila.estado).includes(estado)),
  );
}

export function mapearBandejaExport(filas: readonly ReclamoBandeja[]): FilaBandejaExport[] {
  return filas.map((fila) => ({
    id: fila.id,
    titulo: fila.titulo,
    categoria: CATEGORIA_LABEL[fila.categoria],
    prioridad: PRIORIDAD_LABEL[fila.prioridad],
    estado: ESTADO_LABEL[fila.estado],
    origen: ORIGEN_LABEL[fila.origen_clasificacion],
    adhesiones: fila.adhesiones_count,
    ingreso: fila.created_at,
  }));
}

function protegerCsv(value: string): string {
  if (/^[\t\r\n]/.test(value) || /^[\s]*[=+\-@]/.test(value)) return `'${value}`;
  return value;
}

export function crearCsvBandeja(filas: readonly ReclamoBandeja[]): string {
  const exportables = mapearBandejaExport(filas).map((fila) => ({
    ...fila,
    titulo: protegerCsv(fila.titulo),
  }));
  return Papa.unparse(exportables, { header: true });
}

export function crearJsonBandeja(filas: readonly ReclamoBandeja[]): string {
  return JSON.stringify(mapearBandejaExport(filas), null, 2);
}

export function crearHojaBandeja(filas: readonly ReclamoBandeja[]): Row[] {
  return [
    [
      { value: "ID", fontWeight: "bold" },
      { value: "Reclamo", fontWeight: "bold" },
      { value: "Categoria", fontWeight: "bold" },
      { value: "Prioridad", fontWeight: "bold" },
      { value: "Estado", fontWeight: "bold" },
      { value: "Origen", fontWeight: "bold" },
      { value: "Adhesiones", fontWeight: "bold", align: "right" },
      { value: "Ingreso", fontWeight: "bold" },
    ],
    ...mapearBandejaExport(filas).map((fila) => [
      fila.id,
      fila.titulo,
      fila.categoria,
      fila.prioridad,
      fila.estado,
      fila.origen,
      fila.adhesiones,
      fila.ingreso,
    ]),
  ];
}
