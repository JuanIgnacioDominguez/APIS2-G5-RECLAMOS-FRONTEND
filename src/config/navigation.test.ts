import { describe, expect, it } from "vitest";

import { Rol } from "@/auth/roles";
import { homePorRol, migasPara, navModulo } from "./navigation";

describe("navegacion del modulo de reclamos", () => {
  it("el menu cambia por rol", () => {
    const ciudadano = navModulo(Rol.CIUDADANO).map((i) => i.to);
    expect(ciudadano).toEqual(["/reclamos", "/reclamos/nuevo", "/mapa"]);

    const operador = navModulo(Rol.OPERADOR).map((i) => i.to);
    expect(operador).toEqual(["/backoffice", "/reclamos", "/mapa"]);

    const admin = navModulo(Rol.ADMIN).map((i) => i.to);
    expect(admin).toEqual(["/backoffice", "/reclamos", "/panel", "/mapa"]);
  });

  it("cada rol aterriza en su home", () => {
    expect(homePorRol(Rol.CIUDADANO)).toBe("/reclamos");
    expect(homePorRol(Rol.OPERADOR)).toBe("/backoffice");
    expect(homePorRol(Rol.ADMIN)).toBe("/backoffice");
  });

  it("arma las migas de pan segun la ruta, sin pedir datos al backend", () => {
    expect(migasPara("/reclamos", false)).toEqual([{ label: "Mis reclamos" }]);
    expect(migasPara("/reclamos", true)).toEqual([{ label: "Todos los reclamos" }]);
    expect(migasPara("/reclamos/nuevo", false)).toEqual([
      { label: "Reclamos", to: "/reclamos" },
      { label: "Nuevo reclamo" },
    ]);
    expect(migasPara("/reclamos/abcd1234-ef00", false)).toEqual([
      { label: "Reclamos", to: "/reclamos" },
      { label: "#abcd1234" },
    ]);
    expect(migasPara("/backoffice", true)).toEqual([{ label: "Bandeja de reclamos" }]);
    expect(migasPara("/panel", true)).toEqual([{ label: "Panel de metricas" }]);
    expect(migasPara("/mapa", false)).toEqual([{ label: "Mapa de reclamos" }]);
    expect(migasPara("/desconocida", false)).toEqual([]);
  });
});
