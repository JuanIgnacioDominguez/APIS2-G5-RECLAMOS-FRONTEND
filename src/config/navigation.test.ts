import { describe, expect, it } from "vitest";

import { Rol } from "@/auth/roles";
import { homePorRol, migasPara, navModulo } from "./navigation";

describe("navegacion del modulo de reclamos", () => {
  function rutas(rol: Rol): string[] {
    return navModulo(rol).flatMap((seccion) => seccion.items.map((i) => i.to));
  }

  it("el menu cambia por rol", () => {
    expect(rutas(Rol.CIUDADANO)).toEqual(["/reclamos", "/feed", "/mapa"]);
    // Staff no ven "/feed": ya ven todos los reclamos en "Todos los reclamos".
    expect(rutas(Rol.OPERADOR)).toEqual(["/dashboard", "/backoffice", "/reclamos", "/mapa"]);
    expect(rutas(Rol.ADMIN)).toEqual(["/dashboard", "/backoffice", "/reclamos", "/panel", "/mapa"]);
  });

  it("solo la Bandeja pide contador en vivo", () => {
    const secciones = navModulo(Rol.OPERADOR);
    const conContador = secciones.flatMap((s) => s.items).filter((i) => i.contador);
    expect(conContador.map((i) => i.to)).toEqual(["/backoffice"]);
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
    // Without an origin, a citizen falls back to the city feed (lists every
    // claim), not "Mis reclamos" (where a claim that is not theirs never shows).
    expect(migasPara("/reclamos/abcd1234-ef00", false)).toEqual([
      { label: "Reclamos de la ciudad", to: "/feed" },
      { label: "#abcd1234" },
    ]);
    expect(migasPara("/reclamos/abcd1234-ef00", true)).toEqual([
      { label: "Todos los reclamos", to: "/reclamos" },
      { label: "#abcd1234" },
    ]);
    expect(migasPara("/feed", false)).toEqual([{ label: "Reclamos de la ciudad" }]);
    expect(migasPara("/dashboard", true)).toEqual([{ label: "Dashboard" }]);
    expect(migasPara("/backoffice", true)).toEqual([{ label: "Bandeja de reclamos" }]);
    expect(migasPara("/panel", true)).toEqual([{ label: "Panel de metricas" }]);
    expect(migasPara("/mapa", false)).toEqual([{ label: "Mapa de reclamos" }]);
    expect(migasPara("/desconocida", false)).toEqual([]);
  });

  it("el detalle de un reclamo respeta el origen de navegacion, no siempre Mis reclamos", () => {
    expect(
      migasPara("/reclamos/abcd1234-ef00", false, { label: "Reclamos de la ciudad", to: "/feed" }),
    ).toEqual([{ label: "Reclamos de la ciudad", to: "/feed" }, { label: "#abcd1234" }]);
    expect(
      migasPara("/reclamos/abcd1234-ef00", true, {
        label: "Bandeja de reclamos",
        to: "/backoffice",
      }),
    ).toEqual([{ label: "Bandeja de reclamos", to: "/backoffice" }, { label: "#abcd1234" }]);
  });
});
