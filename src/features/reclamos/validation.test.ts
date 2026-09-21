import { describe, expect, it } from "vitest";

import {
  esFormularioValido,
  validarDescripcion,
  validarTitulo,
  type ReclamoFormValues,
} from "./validation";

describe("validarTitulo", () => {
  it("rechaza titulos demasiado cortos", () => {
    expect(validarTitulo("abc")).toMatch(/al menos 5/);
  });

  it("rechaza titulos demasiado largos", () => {
    expect(validarTitulo("x".repeat(151))).toMatch(/150/);
  });

  it("acepta un titulo valido", () => {
    expect(validarTitulo("Luminaria apagada")).toBeNull();
  });

  it("ignora espacios al medir la longitud", () => {
    expect(validarTitulo("   ab   ")).toMatch(/al menos 5/);
  });
});

describe("validarDescripcion", () => {
  it("rechaza descripciones demasiado cortas", () => {
    expect(validarDescripcion("corta")).toMatch(/al menos 10/);
  });

  it("rechaza descripciones demasiado largas", () => {
    expect(validarDescripcion("x".repeat(5001))).toMatch(/5000/);
  });

  it("acepta una descripcion valida", () => {
    expect(validarDescripcion("Hace una semana que no funciona.")).toBeNull();
  });
});

describe("esFormularioValido", () => {
  const base: ReclamoFormValues = {
    titulo: "Luminaria apagada",
    descripcion: "Hace una semana que no funciona el alumbrado.",
    categoria: null,
    prioridad: null,
    direccion: "",
    barrio: "",
    latitud: null,
    longitud: null,
  };

  it("es verdadero cuando titulo y descripcion son validos", () => {
    expect(esFormularioValido(base)).toBe(true);
  });

  it("es falso si algun campo requerido es invalido", () => {
    expect(esFormularioValido({ ...base, titulo: "no" })).toBe(false);
    expect(esFormularioValido({ ...base, descripcion: "corta" })).toBe(false);
  });
});
