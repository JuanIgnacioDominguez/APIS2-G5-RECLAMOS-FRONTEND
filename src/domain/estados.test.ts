import { describe, expect, it } from "vitest";

import { EstadoReclamo, PrioridadReclamo } from "./enums";
import { escalar, esFinal, puedeTransicionar, transicionesDesde } from "./estados";

describe("maquina de estados", () => {
  it("permite las transiciones validas desde RECIBIDO", () => {
    expect(puedeTransicionar(EstadoReclamo.RECIBIDO, EstadoReclamo.EN_REVISION)).toBe(true);
    expect(puedeTransicionar(EstadoReclamo.RECIBIDO, EstadoReclamo.ASIGNADO)).toBe(true);
    expect(puedeTransicionar(EstadoReclamo.RECIBIDO, EstadoReclamo.RECHAZADO)).toBe(true);
  });

  it("rechaza una transicion que saltea estados", () => {
    expect(puedeTransicionar(EstadoReclamo.RECIBIDO, EstadoReclamo.RESUELTO)).toBe(false);
    expect(puedeTransicionar(EstadoReclamo.RECIBIDO, EstadoReclamo.CERRADO)).toBe(false);
  });

  it("no ofrece transiciones desde un estado final", () => {
    expect(transicionesDesde(EstadoReclamo.CERRADO)).toHaveLength(0);
    expect(transicionesDesde(EstadoReclamo.RECHAZADO)).toHaveLength(0);
  });

  it("marca CERRADO y RECHAZADO como finales", () => {
    expect(esFinal(EstadoReclamo.CERRADO)).toBe(true);
    expect(esFinal(EstadoReclamo.RECHAZADO)).toBe(true);
    expect(esFinal(EstadoReclamo.EN_PROCESO)).toBe(false);
  });

  it("permite volver de EN_PROCESO a ASIGNADO pero no a RECIBIDO", () => {
    expect(puedeTransicionar(EstadoReclamo.EN_PROCESO, EstadoReclamo.ASIGNADO)).toBe(true);
    expect(puedeTransicionar(EstadoReclamo.EN_PROCESO, EstadoReclamo.RECIBIDO)).toBe(false);
  });
});

describe("escalar prioridad", () => {
  it("sube a la prioridad minima cuando la actual es menor", () => {
    expect(escalar(PrioridadReclamo.BAJA, PrioridadReclamo.ALTA)).toBe(PrioridadReclamo.ALTA);
  });

  it("nunca baja una prioridad ya mayor", () => {
    expect(escalar(PrioridadReclamo.CRITICA, PrioridadReclamo.MEDIA)).toBe(
      PrioridadReclamo.CRITICA,
    );
  });

  it("mantiene la prioridad si son iguales", () => {
    expect(escalar(PrioridadReclamo.MEDIA, PrioridadReclamo.MEDIA)).toBe(PrioridadReclamo.MEDIA);
  });
});
