import { describe, expect, it } from "vitest";

import type { ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { contarPorTab, filtrarReclamos, perteneceATab } from "./filters";

function reclamo(id: string, titulo: string, estado: EstadoReclamo): ReclamoResumen {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.OTROS,
    prioridad: PrioridadReclamo.MEDIA,
    estado,
    barrio: null,
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

const lista = [
  reclamo("1", "Bache", EstadoReclamo.RECIBIDO),
  reclamo("2", "Luz", EstadoReclamo.EN_PROCESO),
  reclamo("3", "Ruido", EstadoReclamo.RESUELTO),
  reclamo("4", "Arbol", EstadoReclamo.CERRADO),
  reclamo("5", "Agua", EstadoReclamo.ASIGNADO),
];

describe("perteneceATab", () => {
  it("clasifica cada estado en su tab", () => {
    expect(perteneceATab(EstadoReclamo.RECIBIDO, "abiertos")).toBe(true);
    expect(perteneceATab(EstadoReclamo.ASIGNADO, "abiertos")).toBe(true);
    expect(perteneceATab(EstadoReclamo.EN_PROCESO, "en_proceso")).toBe(true);
    expect(perteneceATab(EstadoReclamo.RESUELTO, "resueltos")).toBe(true);
    expect(perteneceATab(EstadoReclamo.CERRADO, "resueltos")).toBe(true);
  });

  it("el tab 'todos' acepta cualquier estado", () => {
    expect(perteneceATab(EstadoReclamo.RECHAZADO, "todos")).toBe(true);
  });

  it("no mezcla estados entre tabs", () => {
    expect(perteneceATab(EstadoReclamo.EN_PROCESO, "abiertos")).toBe(false);
    expect(perteneceATab(EstadoReclamo.RECIBIDO, "resueltos")).toBe(false);
  });
});

describe("filtrarReclamos", () => {
  it("filtra por tab", () => {
    expect(filtrarReclamos(lista, "abiertos", "").map((r) => r.id)).toEqual(["1", "5"]);
    expect(filtrarReclamos(lista, "resueltos", "").map((r) => r.id)).toEqual(["3", "4"]);
  });

  it("filtra por texto ignorando mayusculas", () => {
    expect(filtrarReclamos(lista, "todos", "RUI").map((r) => r.id)).toEqual(["3"]);
  });

  it("combina tab y texto", () => {
    expect(filtrarReclamos(lista, "abiertos", "agua").map((r) => r.id)).toEqual(["5"]);
  });
});

describe("contarPorTab", () => {
  it("cuenta cada bucket", () => {
    expect(contarPorTab(lista)).toEqual({
      todos: 5,
      abiertos: 2,
      en_proceso: 1,
      resueltos: 2,
    });
  });
});
