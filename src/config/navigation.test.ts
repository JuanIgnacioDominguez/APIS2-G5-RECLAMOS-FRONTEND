import { describe, expect, it } from "vitest";

import { Rol } from "@/auth/roles";
import { homePorRol, migasPara, navModulo } from "./navigation";

describe("navegacion del modulo de reclamos", () => {
  function rutas(rol: Rol): string[] {
    return navModulo(rol).flatMap((seccion) => seccion.items.map((i) => i.to));
  }

  it("el menu cambia por rol", () => {
    expect(rutas(Rol.CIUDADANO)).toEqual(["/reclamos", "/feed", "/mapa"]);
    expect(rutas(Rol.OPERADOR)).toEqual(["/backoffice", "/reclamos", "/feed", "/mapa"]);
    expect(rutas(Rol.ADMIN)).toEqual(["/backoffice", "/reclamos", "/panel", "/feed", "/mapa"]);
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
    expect(migasPara("/reclamos/abcd1234-ef00", false)).toEqual([
      { label: "Reclamos", to: "/reclamos" },
      { label: "#abcd1234" },
    ]);
    expect(migasPara("/feed", false)).toEqual([{ label: "Reclamos de la ciudad" }]);
    expect(migasPara("/backoffice", true)).toEqual([{ label: "Bandeja de reclamos" }]);
    expect(migasPara("/panel", true)).toEqual([{ label: "Panel de metricas" }]);
    expect(migasPara("/mapa", false)).toEqual([{ label: "Mapa de reclamos" }]);
    expect(migasPara("/desconocida", false)).toEqual([]);
  });
});
