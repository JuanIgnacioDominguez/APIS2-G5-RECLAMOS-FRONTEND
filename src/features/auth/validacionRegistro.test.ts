import { describe, expect, it } from "vitest";

import { hayErrores, NOMBRE_MAX, validarRegistro } from "./validacionRegistro";

const ok = {
  nombre: "Vecina de Palermo",
  email: "vecina@ejemplo.com",
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

  it("ya no pide contrasena (registro sin password)", () => {
    // Only name and email are validated now.
    expect(Object.keys(validarRegistro(ok))).toHaveLength(0);
  });
});
