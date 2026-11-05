import { describe, expect, it } from "vitest";

import { afectaCirculacion, esIncidenteActivo } from "./circulacion";
import { CATEGORIAS, CategoriaReclamo, EstadoReclamo } from "./enums";

describe("afectaCirculacion", () => {
  it.each([
    [CategoriaReclamo.TRANSITO, true],
    [CategoriaReclamo.BACHES, true],
    [CategoriaReclamo.ARBOLADO, true],
    [CategoriaReclamo.ALUMBRADO, false],
    [CategoriaReclamo.RUIDOS, false],
    [CategoriaReclamo.ESPACIOS_PUBLICOS, false],
  ])("%s -> %s", (categoria, esperado) => {
    expect(afectaCirculacion(categoria)).toBe(esperado);
  });

  it("solo tres categorias se comparten con Movilidad y Espacios", () => {
    expect(CATEGORIAS.filter(afectaCirculacion)).toHaveLength(3);
  });
});

describe("esIncidenteActivo", () => {
  it.each([
    [EstadoReclamo.RECIBIDO, true],
    [EstadoReclamo.EN_REVISION, true],
    [EstadoReclamo.ASIGNADO, true],
    [EstadoReclamo.EN_PROCESO, true],
    [EstadoReclamo.RESUELTO, false],
    [EstadoReclamo.RECHAZADO, false],
    [EstadoReclamo.CERRADO, false],
  ])("un bache en %s -> %s", (estado, esperado) => {
    expect(esIncidenteActivo({ afecta_circulacion: true, estado })).toBe(esperado);
  });

  it("un reclamo abierto que no corta la circulacion no es incidente", () => {
    expect(esIncidenteActivo({ afecta_circulacion: false, estado: EstadoReclamo.RECIBIDO })).toBe(
      false,
    );
  });
});
