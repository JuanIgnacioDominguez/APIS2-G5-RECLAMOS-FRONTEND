import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/render";
import { ADMIN, CIUDADANO, OPERADOR } from "@/test/usuarios";
import { App } from "./App";

vi.mock("@/components/AppLayout", async () => {
  const { Outlet } = await import("react-router-dom");
  return { AppLayout: Outlet };
});

vi.mock("@/api/reclamos", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/api/reclamos")>();
  return {
    ...original,
    listarReclamos: async () => ({ items: [], total: 0, page: 1, size: 100 }),
    contarResueltos: async () => 0,
    bandeja: async () => ({ items: [], total: 0, page: 1, size: 20 }),
    estadisticas: async () => ({
      total: 0,
      por_estado: [],
      por_categoria: [],
      por_prioridad: [],
      tiempo_resolucion_horas_promedio: null,
    }),
  };
});

const esperaRuta = { timeout: 3000 };

describe("App", () => {
  it("muestra el login en /login", async () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(
      await screen.findByRole("button", { name: /^ingresar$/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it("redirige al login cuando no hay sesion", async () => {
    renderWithProviders(<App />, { route: "/reclamos" });
    expect(
      await screen.findByRole("button", { name: /^ingresar$/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it("con sesion, la raiz lleva al modulo de reclamos", async () => {
    renderWithProviders(<App />, { route: "/", usuario: CIUDADANO });
    expect(
      await screen.findByRole("heading", { name: /mis reclamos/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it("un operador aterriza en la bandeja de backoffice", async () => {
    renderWithProviders(<App />, { route: "/", usuario: OPERADOR }); // operador
    expect(
      await screen.findByRole("heading", { name: /bandeja de reclamos/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it("un ciudadano no puede entrar al backoffice", async () => {
    renderWithProviders(<App />, { route: "/backoffice", usuario: CIUDADANO }); // ciudadano
    expect(
      await screen.findByRole("heading", { name: /mis reclamos/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it.each([
    { rol: "operador", usuario: OPERADOR },
    { rol: "admin", usuario: ADMIN },
  ])("un $rol accede al dashboard", async ({ usuario }) => {
    renderWithProviders(<App />, { route: "/dashboard", usuario });
    expect(
      await screen.findByRole("heading", { name: /dashboard/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it("un ciudadano no puede entrar al dashboard", async () => {
    renderWithProviders(<App />, { route: "/dashboard", usuario: CIUDADANO });
    expect(
      await screen.findByRole("heading", { name: /mis reclamos/i }, esperaRuta),
    ).toBeInTheDocument();
  });

  it("un admin accede al panel de metricas", async () => {
    renderWithProviders(<App />, { route: "/panel", usuario: ADMIN }); // admin
    expect(
      await screen.findByRole("heading", { name: /panel de metricas/i }, esperaRuta),
    ).toBeInTheDocument();
  });
});
