import { describe, expect, it } from "vitest";

import { Rol, ROL_LABEL, esStaff } from "./roles";

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
});
