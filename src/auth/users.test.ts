import { describe, expect, it } from "vitest";

import { Rol } from "./roles";
import { USUARIOS_DEMO, buscarUsuarioDemo } from "./users";

describe("usuarios demo", () => {
  it("hay un usuario por cada rol", () => {
    const roles = USUARIOS_DEMO.map((u) => u.rol);
    expect(roles).toContain(Rol.CIUDADANO);
    expect(roles).toContain(Rol.OPERADOR);
    expect(roles).toContain(Rol.ADMIN);
  });

  it("busca por email sin distinguir mayusculas", () => {
    expect(buscarUsuarioDemo("OPERADOR@ciudad.gob.ar")?.rol).toBe(Rol.OPERADOR);
    expect(buscarUsuarioDemo("  admin@ciudad.gob.ar  ")?.rol).toBe(Rol.ADMIN);
  });

  it("devuelve undefined para un email desconocido", () => {
    expect(buscarUsuarioDemo("otro@mail.com")).toBeUndefined();
  });
});
