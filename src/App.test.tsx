import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import { renderWithProviders } from "@/test/render";
import { App } from "./App";

describe("App", () => {
  it("muestra el login en /login", () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.getByRole("button", { name: /^ingresar$/i })).toBeInTheDocument();
  });

  it("redirige la raiz al modulo de reclamos", () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 20,
    });
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { name: /mis reclamos/i })).toBeInTheDocument();
  });

  it("muestra el placeholder de una seccion de otro grupo", () => {
    renderWithProviders(<App />, { route: "/residuos" });
    expect(screen.getByRole("heading", { name: "Residuos" })).toBeInTheDocument();
  });
});
