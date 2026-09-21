import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import type { Estadisticas } from "@/api/types";
import { renderWithProviders } from "@/test/render";
import { PanelPage } from "./PanelPage";

const stats: Estadisticas = {
  total: 42,
  por_estado: [
    { clave: "RECIBIDO", cantidad: 10 },
    { clave: "RESUELTO", cantidad: 32 },
  ],
  por_categoria: [{ clave: "BACHES", cantidad: 20 }],
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
    expect(screen.getByText("Por categoria")).toBeInTheDocument();
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "estadisticas").mockRejectedValue(new Error("500"));
    renderWithProviders(<PanelPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
