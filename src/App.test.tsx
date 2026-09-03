import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import { renderWithProviders } from "@/test/render";
import { ADMIN, CIUDADANO, OPERADOR } from "@/test/usuarios";
import { App } from "./App";

describe("App", () => {
  it("muestra el login en /login", () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.getByRole("button", { name: /^ingresar$/i })).toBeInTheDocument();
  });

  it("redirige al login cuando no hay sesion", () => {
    renderWithProviders(<App />, { route: "/reclamos" });
    expect(screen.getByRole("button", { name: /^ingresar$/i })).toBeInTheDocument();
  });

  it("con sesion, la raiz lleva al modulo de reclamos", () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 20,
    });
    renderWithProviders(<App />, { route: "/", usuario: CIUDADANO });
    expect(screen.getByRole("heading", { name: /mis reclamos/i })).toBeInTheDocument();
  });

  it("un operador aterriza en la bandeja de backoffice", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 20,
    });
    renderWithProviders(<App />, { route: "/", usuario: OPERADOR }); // operador
    expect(
      await screen.findByRole("heading", { name: /bandeja de reclamos/i }),
    ).toBeInTheDocument();
  });

  it("un ciudadano no puede entrar al backoffice", () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 20,
    });
    renderWithProviders(<App />, { route: "/backoffice", usuario: CIUDADANO }); // ciudadano
    expect(screen.getByRole("heading", { name: /mis reclamos/i })).toBeInTheDocument();
  });

  it("un admin accede al panel de metricas", async () => {
    vi.spyOn(reclamosApi, "estadisticas").mockResolvedValue({
      total: 0,
      por_estado: [],
      por_categoria: [],
      por_prioridad: [],
      tiempo_resolucion_horas_promedio: null,
    });
    renderWithProviders(<App />, { route: "/panel", usuario: ADMIN }); // admin
    expect(await screen.findByRole("heading", { name: /panel de metricas/i })).toBeInTheDocument();
  });
});
