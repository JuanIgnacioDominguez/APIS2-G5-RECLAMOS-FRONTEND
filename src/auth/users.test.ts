import { describe, expect, it } from "vitest";

import { Rol } from "./roles";
import { CREDENCIALES_DEMO } from "./users";

describe("credenciales demo", () => {
  it("hay una credencial por cada rol", () => {
    const roles = CREDENCIALES_DEMO.map((c) => c.rol);
    expect(roles).toContain(Rol.CIUDADANO);
    expect(roles).toContain(Rol.OPERADOR);
    expect(roles).toContain(Rol.ADMIN);
  });

  it("coinciden con los usuarios de prueba del backend (pass = usuario)", () => {
    expect(CREDENCIALES_DEMO.map((c) => c.usuario)).toEqual(["vecino1", "operador1", "admin1"]);
    expect(CREDENCIALES_DEMO.every((c) => c.password === c.usuario)).toBe(true);
  });
});
