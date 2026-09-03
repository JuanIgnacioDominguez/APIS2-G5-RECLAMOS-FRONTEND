import { describe, expect, it } from "vitest";

import { Rol } from "@/auth/roles";
import { homePorRol, navModulo } from "./navigation";

describe("navegacion del modulo de reclamos", () => {
  it("el menu cambia por rol", () => {
    const ciudadano = navModulo(Rol.CIUDADANO).map((i) => i.to);
    expect(ciudadano).toEqual(["/reclamos", "/reclamos/nuevo"]);

    const operador = navModulo(Rol.OPERADOR).map((i) => i.to);
    expect(operador).toEqual(["/backoffice"]);

    const admin = navModulo(Rol.ADMIN).map((i) => i.to);
    expect(admin).toEqual(["/backoffice", "/panel"]);
  });

  it("cada rol aterriza en su home", () => {
    expect(homePorRol(Rol.CIUDADANO)).toBe("/reclamos");
    expect(homePorRol(Rol.OPERADOR)).toBe("/backoffice");
    expect(homePorRol(Rol.ADMIN)).toBe("/backoffice");
  });
});
