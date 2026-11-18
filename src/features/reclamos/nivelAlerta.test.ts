import { describe, expect, it } from "vitest";

import { NivelCriticidad } from "@/domain/enums";
import { ordenarPorAlerta, severidadAlerta, textoBadgeAlerta } from "./nivelAlerta";

interface Fila {
  id: string;
  bajo_alerta_climatica: boolean;
  alerta_nivel: NivelCriticidad | null;
}

function fila(id: string, nivel: NivelCriticidad | null, bajo = nivel !== null): Fila {
  return { id, bajo_alerta_climatica: bajo, alerta_nivel: nivel };
}

describe("severidadAlerta", () => {
  it("ordena los niveles de menor a mayor y vale 0 sin nivel", () => {
    expect(severidadAlerta(null)).toBe(0);
    expect(severidadAlerta(NivelCriticidad.BAJA)).toBeLessThan(
      severidadAlerta(NivelCriticidad.MEDIA),
    );
    expect(severidadAlerta(NivelCriticidad.MEDIA)).toBeLessThan(
      severidadAlerta(NivelCriticidad.ALTA),
    );
    expect(severidadAlerta(NivelCriticidad.ALTA)).toBeLessThan(
      severidadAlerta(NivelCriticidad.CRITICA),
    );
  });
});

describe("textoBadgeAlerta", () => {
  it("incluye el nivel cuando llega", () => {
    expect(textoBadgeAlerta(NivelCriticidad.CRITICA)).toBe("Alerta climática: Crítica");
    expect(textoBadgeAlerta(NivelCriticidad.BAJA)).toBe("Alerta climática: Baja");
  });

  it("muestra solo el titulo cuando no hay nivel", () => {
    expect(textoBadgeAlerta(null)).toBe("Alerta climática");
  });
});

describe("ordenarPorAlerta", () => {
  it("pone arriba los reclamos bajo alerta, del nivel mas grave al mas leve", () => {
    const filas = [
      fila("sin-alerta", null),
      fila("baja", NivelCriticidad.BAJA),
      fila("critica", NivelCriticidad.CRITICA),
      fila("alta", NivelCriticidad.ALTA),
    ];
    expect(ordenarPorAlerta(filas).map((f) => f.id)).toEqual([
      "critica",
      "alta",
      "baja",
      "sin-alerta",
    ]);
  });

  it("conserva el orden del servidor entre reclamos del mismo peso", () => {
    const filas = [
      fila("a", null),
      fila("b", NivelCriticidad.MEDIA),
      fila("c", null),
      fila("d", NivelCriticidad.MEDIA),
    ];
    expect(ordenarPorAlerta(filas).map((f) => f.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("un reclamo bajo alerta sin nivel va antes que uno sin alerta", () => {
    const filas = [fila("normal", null), fila("sin-nivel", null, true)];
    expect(ordenarPorAlerta(filas).map((f) => f.id)).toEqual(["sin-nivel", "normal"]);
  });

  it("no modifica el arreglo original", () => {
    const filas = [fila("a", null), fila("b", NivelCriticidad.ALTA)];
    ordenarPorAlerta(filas);
    expect(filas.map((f) => f.id)).toEqual(["a", "b"]);
  });

  it("devuelve una lista vacia si no hay reclamos", () => {
    expect(ordenarPorAlerta([])).toEqual([]);
  });
});
