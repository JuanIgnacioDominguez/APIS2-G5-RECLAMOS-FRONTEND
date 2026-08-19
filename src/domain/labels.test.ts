import { describe, expect, it } from "vitest";

import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo, ESTADOS, CATEGORIAS } from "./enums";
import {
  CATEGORIA_LABEL,
  ESTADO_COLOR,
  ESTADO_LABEL,
  opcionesCategoria,
  opcionesEstado,
  opcionesPrioridad,
  PRIORIDAD_LABEL,
} from "./labels";

describe("labels de dominio", () => {
  it("tiene una etiqueta para cada estado", () => {
    for (const estado of ESTADOS) {
      expect(ESTADO_LABEL[estado]).toBeTruthy();
      expect(ESTADO_COLOR[estado]).toBeTruthy();
    }
  });

  it("tiene una etiqueta para cada categoria", () => {
    for (const categoria of CATEGORIAS) {
      expect(CATEGORIA_LABEL[categoria]).toBeTruthy();
    }
  });

  it("traduce estados y prioridades al espanol", () => {
    expect(ESTADO_LABEL[EstadoReclamo.EN_REVISION]).toBe("En revision");
    expect(PRIORIDAD_LABEL[PrioridadReclamo.CRITICA]).toBe("Critica");
    expect(CATEGORIA_LABEL[CategoriaReclamo.AGUA_CLOACAS]).toBe("Agua y cloacas");
  });

  it("genera opciones value/label para los selects", () => {
    const estados = opcionesEstado();
    expect(estados).toHaveLength(ESTADOS.length);
    expect(estados[0]).toEqual({ value: "RECIBIDO", label: "Recibido" });
    expect(opcionesPrioridad()).toHaveLength(4);
    expect(opcionesCategoria()).toHaveLength(CATEGORIAS.length);
  });
});
