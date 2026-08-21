import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import { renderWithProviders } from "@/test/render";
import { USUARIOS_DEMO } from "@/auth/users";
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
    renderWithProviders(<App />, { route: "/", usuario: USUARIOS_DEMO[0] });
    expect(screen.getByRole("heading", { name: /mis reclamos/i })).toBeInTheDocument();
  });

  it("con sesion, muestra el placeholder de otra seccion", () => {
    renderWithProviders(<App />, { route: "/residuos", usuario: USUARIOS_DEMO[0] });
    expect(screen.getByRole("heading", { name: "Residuos" })).toBeInTheDocument();
  });
});
