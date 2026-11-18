import { describe, expect, it } from "vitest";

import type { AlertaClimaticaOut } from "@/api/types";
import { NivelCriticidad } from "@/domain/enums";
import {
  formatearFenomeno,
  formatHasta,
  nombreBarrio,
  ordenarAlertas,
  resumirBarrios,
} from "./alertasVigentes";

function alerta(parcial: Partial<AlertaClimaticaOut> = {}): AlertaClimaticaOut {
  return {
    alerta_id: "a-1",
    nivel: NivelCriticidad.MEDIA,
    fenomeno: "TORMENTA_FUERTE",
    barrios: ["BALVANERA"],
    vigencia_desde: "2026-11-17T15:00:00Z",
    vigencia_hasta: "2026-11-20T16:07:00Z",
    estado: "CONFIRMADA",
    ...parcial,
  };
}

describe("formatearFenomeno", () => {
  it("pasa el simbolo a texto legible", () => {
    expect(formatearFenomeno("TORMENTA_FUERTE")).toBe("Tormenta fuerte");
    expect(formatearFenomeno("OLA_DE_CALOR")).toBe("Ola de calor");
  });

  it("no rompe con un fenomeno vacio", () => {
    expect(formatearFenomeno("  ")).toBe("Fenómeno sin especificar");
  });
});

describe("nombreBarrio", () => {
  it("normaliza mayusculas y deja en minuscula las palabras menores", () => {
    expect(nombreBarrio("BARRIO DEMO ALERTA")).toBe("Barrio Demo Alerta");
    expect(nombreBarrio("VILLA DEL PARQUE")).toBe("Villa del Parque");
  });
});

describe("resumirBarrios", () => {
  it("muestra hasta tres y cuenta el resto", () => {
    const r = resumirBarrios(["A", "B", "C", "D", "E"]);
    expect(r.visibles).toEqual(["A", "B", "C"]);
    expect(r.restantes).toBe(2);
  });

  it("sin barrios devuelve lista vacia", () => {
    expect(resumirBarrios([])).toEqual({ visibles: [], restantes: 0 });
  });
});

describe("formatHasta", () => {
  it("usa la hora de Buenos Aires", () => {
    // 16:07 UTC is 13:07 in Buenos Aires (UTC-3).
    expect(formatHasta("2026-11-20T16:07:00Z")).toBe("20/11 13:07");
  });

  it("devuelve guion con una fecha invalida", () => {
    expect(formatHasta("no es una fecha")).toBe("-");
  });
});

describe("ordenarAlertas", () => {
  it("pone primero la mas grave y no modifica el original", () => {
    const original = [
      alerta({ alerta_id: "baja", nivel: NivelCriticidad.BAJA }),
      alerta({ alerta_id: "critica", nivel: NivelCriticidad.CRITICA }),
      alerta({ alerta_id: "alta", nivel: NivelCriticidad.ALTA }),
    ];
    const ordenadas = ordenarAlertas(original);
    expect(ordenadas.map((a) => a.alerta_id)).toEqual(["critica", "alta", "baja"]);
    expect(original[0].alerta_id).toBe("baja");
  });

  it("entre iguales va primero la que termina antes", () => {
    const ordenadas = ordenarAlertas([
      alerta({ alerta_id: "tarde", vigencia_hasta: "2026-11-21T10:00:00Z" }),
      alerta({ alerta_id: "temprano", vigencia_hasta: "2026-11-19T10:00:00Z" }),
    ]);
    expect(ordenadas.map((a) => a.alerta_id)).toEqual(["temprano", "tarde"]);
  });
});
