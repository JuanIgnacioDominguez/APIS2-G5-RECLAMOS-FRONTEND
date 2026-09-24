import { describe, expect, it } from "vitest";

import { Rol } from "@/auth/roles";
import { pasosParaRuta } from "./tours";

describe("pasosParaRuta", () => {
  it("devuelve pasos para las pantallas conocidas", () => {
    expect(pasosParaRuta("/reclamos", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/reclamos", Rol.OPERADOR)).not.toBeNull();
    expect(pasosParaRuta("/reclamos/nuevo", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/reclamos/abc123", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/backoffice", Rol.OPERADOR)).not.toBeNull();
    expect(pasosParaRuta("/dashboard", Rol.ADMIN)).not.toBeNull();
    expect(pasosParaRuta("/feed", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/mapa", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/panel", Rol.ADMIN)).not.toBeNull();
    expect(pasosParaRuta("/cuenta", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/notificaciones", Rol.CIUDADANO)).not.toBeNull();
    expect(pasosParaRuta("/configuracion", null)).not.toBeNull();
    expect(pasosParaRuta("/ayuda", Rol.CIUDADANO)).not.toBeNull();
  });

  it("devuelve null en rutas sin tour", () => {
    expect(pasosParaRuta("/login", null)).toBeNull();
    expect(pasosParaRuta("/inexistente", Rol.CIUDADANO)).toBeNull();
  });

  it("los tours de reclamos cambian por rol (ciudadano vs staff)", () => {
    const ciudadano = pasosParaRuta("/reclamos", Rol.CIUDADANO)!;
    const staff = pasosParaRuta("/reclamos", Rol.OPERADOR)!;
    const t1 = ciudadano.find((p) => p.selector === '[data-tour="reclamos-header"]');
    const t2 = staff.find((p) => p.selector === '[data-tour="reclamos-header"]');
    expect(t1?.titulo).toMatch(/mis reclamos/i);
    expect(t2?.titulo).toMatch(/todos los reclamos/i);
  });

  it("el detalle diferencia staff del ciudadano", () => {
    const staff = pasosParaRuta("/reclamos/xyz", Rol.OPERADOR)!;
    const ciudadano = pasosParaRuta("/reclamos/xyz", Rol.CIUDADANO)!;
    expect(staff.some((p) => p.selector === '[data-tour="detalle-gestion"]')).toBe(true);
    expect(ciudadano.some((p) => p.selector === '[data-tour="detalle-gestion"]')).toBe(false);
    expect(ciudadano.some((p) => p.selector === '[data-tour="detalle-adhesion"]')).toBe(true);
  });

  it("cada paso tiene titulo y descripcion (para ser util)", () => {
    const rutas = ["/reclamos", "/backoffice", "/dashboard", "/feed", "/mapa"];
    for (const ruta of rutas) {
      const pasos = pasosParaRuta(ruta, Rol.OPERADOR)!;
      for (const paso of pasos) {
        expect(paso.titulo.length).toBeGreaterThan(0);
        expect(paso.descripcion.length).toBeGreaterThan(20);
      }
    }
  });
});
