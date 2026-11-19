import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import type { Estadisticas } from "@/api/types";
import { renderWithProviders } from "@/test/render";
import { PanelPage } from "./PanelPage";

const stats: Estadisticas = {
  total: 42,
  por_estado: [
    { clave: "EN_REVISION", cantidad: 10 },
    { clave: "RESUELTO", cantidad: 32 },
  ],
  por_categoria: [
    { clave: "AGUA_CLOACAS", cantidad: 20 },
    { clave: "CATEGORIA_NUEVA", cantidad: 1 },
  ],
  por_prioridad: [{ clave: "ALTA", cantidad: 15 }],
  tiempo_resolucion_horas_promedio: 12.5,
};

describe("PanelPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra el total, el tiempo promedio y las distribuciones", async () => {
    vi.spyOn(reclamosApi, "estadisticas").mockResolvedValue(stats);
    renderWithProviders(<PanelPage />);

    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(screen.getByText("12.5 h")).toBeInTheDocument();
    expect(screen.getByText("Por estado")).toBeInTheDocument();
    expect(screen.getByText("Por categoría")).toBeInTheDocument();
  });

  it("muestra las etiquetas en espanol en lugar de los codigos de la API", async () => {
    vi.spyOn(reclamosApi, "estadisticas").mockResolvedValue(stats);
    renderWithProviders(<PanelPage />);

    expect(await screen.findByText("En revision")).toBeInTheDocument();
    expect(screen.getByText("Agua y cloacas")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.queryByText("EN_REVISION")).not.toBeInTheDocument();
    expect(screen.queryByText("AGUA_CLOACAS")).not.toBeInTheDocument();
    // Unknown codes still render instead of disappearing
    expect(screen.getByText("CATEGORIA_NUEVA")).toBeInTheDocument();
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "estadisticas").mockRejectedValue(new Error("500"));
    renderWithProviders(<PanelPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
