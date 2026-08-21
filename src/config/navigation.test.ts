import { describe, expect, it } from "vitest";

import { Rol } from "@/auth/roles";
import { CUENTA, OTROS_SERVICIOS, homePorRol, navItemPorRuta, navModulo } from "./navigation";

describe("navegacion", () => {
  it("las otras secciones pertenecen a otro grupo (son placeholders)", () => {
    expect(OTROS_SERVICIOS.every((s) => s.ownerGroup !== null)).toBe(true);
    expect(OTROS_SERVICIOS.some((s) => s.to === "/movilidad")).toBe(true);
  });

  it("el menu del modulo cambia por rol", () => {
    const ciudadano = navModulo(Rol.CIUDADANO).map((i) => i.to);
    expect(ciudadano).toContain("/reclamos");
    expect(ciudadano).toContain("/reclamos/nuevo");

    const operador = navModulo(Rol.OPERADOR).map((i) => i.to);
    expect(operador).toEqual(["/backoffice"]);

    const admin = navModulo(Rol.ADMIN).map((i) => i.to);
    expect(admin).toContain("/backoffice");
    expect(admin).toContain("/panel");
  });

  it("cada rol aterriza en su home", () => {
    expect(homePorRol(Rol.CIUDADANO)).toBe("/reclamos");
    expect(homePorRol(Rol.OPERADOR)).toBe("/backoffice");
    expect(homePorRol(Rol.ADMIN)).toBe("/backoffice");
  });

  it("navItemPorRuta encuentra las secciones placeholder", () => {
    expect(navItemPorRuta("/movilidad")?.label).toBe("Movilidad");
    expect(navItemPorRuta(CUENTA[0].to)?.label).toBe(CUENTA[0].label);
    expect(navItemPorRuta("/no-existe")).toBeUndefined();
  });
});
