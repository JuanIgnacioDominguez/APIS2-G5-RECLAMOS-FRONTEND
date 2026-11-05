import { describe, expect, it } from "vitest";

import {
  hayErrores,
  NOMBRE_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  validarRegistro,
} from "./validacionRegistro";

const ok = {
  nombre: "Vecina de Palermo",
  email: "vecina@ejemplo.com",
  password: "una-clave-larga",
};

describe("validarRegistro", () => {
  it("no devuelve errores con datos validos", () => {
    const errores = validarRegistro(ok);
    expect(hayErrores(errores)).toBe(false);
  });

  it("exige un nombre de al menos dos caracteres", () => {
    expect(validarRegistro({ ...ok, nombre: "A" }).nombre).toBeTruthy();
  });

  it("rechaza un nombre demasiado largo", () => {
    expect(validarRegistro({ ...ok, nombre: "x".repeat(NOMBRE_MAX + 1) }).nombre).toBeTruthy();
  });

  it.each(["sin-arroba", "falta@dominio", "@ejemplo.com", "espacio @ejemplo.com"])(
    "rechaza el email invalido %s",
    (email) => {
      expect(validarRegistro({ ...ok, email }).email).toBeTruthy();
    },
  );

  it("acepta el email sin distinguir mayusculas", () => {
    expect(validarRegistro({ ...ok, email: "Vecina@Ejemplo.COM" }).email).toBeUndefined();
  });

  it(`pide una contrasena de al menos ${PASSWORD_MIN} caracteres`, () => {
    expect(validarRegistro({ ...ok, password: "corta" }).password).toBeTruthy();
  });

  it(`rechaza una contrasena de mas de ${PASSWORD_MAX} caracteres`, () => {
    expect(
      validarRegistro({ ...ok, password: "x".repeat(PASSWORD_MAX + 1) }).password,
    ).toBeTruthy();
  });

  it("no pide mayusculas ni simbolos, solo longitud", () => {
    // 10 lowercase letters, no digits or symbols: valid.
    expect(validarRegistro({ ...ok, password: "abcdefghij" }).password).toBeUndefined();
  });
});
