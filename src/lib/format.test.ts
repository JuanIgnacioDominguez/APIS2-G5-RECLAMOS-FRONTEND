import { describe, expect, it } from "vitest";

import { formatConfianza, formatFecha, haceCuanto, idCorto } from "./format";

describe("formatFecha", () => {
  it("formatea una fecha ISO valida", () => {
    const out = formatFecha("2026-08-19T15:45:00Z");
    expect(out).toContain("2026");
    expect(out).not.toBe("-");
  });

  it("devuelve '-' ante una fecha invalida", () => {
    expect(formatFecha("no-es-fecha")).toBe("-");
  });
});

describe("haceCuanto", () => {
  const now = new Date("2026-08-19T12:00:00Z");

  it("resuelve instantes, minutos, horas y dias", () => {
    expect(haceCuanto("2026-08-19T11:59:40Z", now)).toBe("hace instantes");
    expect(haceCuanto("2026-08-19T11:30:00Z", now)).toBe("hace 30 min");
    expect(haceCuanto("2026-08-19T09:00:00Z", now)).toBe("hace 3 h");
    expect(haceCuanto("2026-08-18T12:00:00Z", now)).toBe("hace 1 dia");
    expect(haceCuanto("2026-08-16T12:00:00Z", now)).toBe("hace 3 dias");
  });

  it("devuelve '-' ante una fecha invalida", () => {
    expect(haceCuanto("xxx", now)).toBe("-");
  });
});

describe("formatConfianza", () => {
  it("convierte a porcentaje entero", () => {
    expect(formatConfianza(0.87)).toBe("87%");
    expect(formatConfianza(0)).toBe("0%");
    expect(formatConfianza(1)).toBe("100%");
  });

  it("acota valores fuera de rango", () => {
    expect(formatConfianza(1.5)).toBe("100%");
    expect(formatConfianza(-0.2)).toBe("0%");
  });

  it("devuelve '-' ante null o undefined", () => {
    expect(formatConfianza(null)).toBe("-");
    expect(formatConfianza(undefined)).toBe("-");
  });
});

describe("idCorto", () => {
  it("toma los primeros 8 caracteres sin guiones", () => {
    expect(idCorto("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("#a1b2c3d4");
  });
});
