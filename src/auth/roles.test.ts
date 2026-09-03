import { describe, expect, it } from "vitest";

import { Rol, ROL_LABEL, esStaff, rolPrincipal } from "./roles";

describe("roles", () => {
  it("etiqueta cada rol", () => {
    expect(ROL_LABEL[Rol.CIUDADANO]).toBe("Ciudadano");
    expect(ROL_LABEL[Rol.OPERADOR]).toBe("Operador");
    expect(ROL_LABEL[Rol.ADMIN]).toBe("Administrador");
  });

  it("operador y admin son staff; ciudadano no", () => {
    expect(esStaff(Rol.OPERADOR)).toBe(true);
    expect(esStaff(Rol.ADMIN)).toBe(true);
    expect(esStaff(Rol.CIUDADANO)).toBe(false);
  });

  it("rolPrincipal toma el rol mas privilegiado del token", () => {
    expect(rolPrincipal(["operador", "admin"])).toBe(Rol.ADMIN);
    expect(rolPrincipal(["operador"])).toBe(Rol.OPERADOR);
    expect(rolPrincipal(["ciudadano"])).toBe(Rol.CIUDADANO);
    expect(rolPrincipal([])).toBe(Rol.CIUDADANO);
  });
});
