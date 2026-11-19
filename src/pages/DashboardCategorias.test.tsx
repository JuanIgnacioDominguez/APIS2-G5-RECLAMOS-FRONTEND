import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import type { Estadisticas } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ADMIN } from "@/test/usuarios";
import { DashboardPage } from "./DashboardPage";

const estadisticas: Estadisticas = {
  total: 3,
  por_estado: [{ clave: EstadoReclamo.RECIBIDO, cantidad: 3 }],
  por_categoria: [
    { clave: CategoriaReclamo.AGUA_CLOACAS, cantidad: 2 },
    { clave: CategoriaReclamo.ESPACIOS_PUBLICOS, cantidad: 1 },
  ],
  por_prioridad: [{ clave: PrioridadReclamo.MEDIA, cantidad: 3 }],
  tiempo_resolucion_horas_promedio: null,
};

function tarjetaCategorias(): HTMLElement {
  // The card is the closest ancestor that also holds the legend rows
  const titulo = screen.getByText("Reclamos por categoría");
  const tarjeta = titulo.closest('[class*="xl:col-span-4"]');
  if (!(tarjeta instanceof HTMLElement)) throw new Error("No se encontro la tarjeta");
  return tarjeta;
}

describe("DashboardPage - reclamos por categoria", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(reclamosApi, "estadisticas").mockResolvedValue(estadisticas);
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 100,
    });
  });

  it("muestra el nombre completo de cada categoria en la leyenda", async () => {
    renderWithProviders(<DashboardPage />, { usuario: ADMIN });
    await screen.findByText("Reclamos por categoría");

    const tarjeta = within(tarjetaCategorias());
    expect(tarjeta.getByText("Agua y cloacas")).toBeInTheDocument();
    expect(tarjeta.getByText("Espacios publicos")).toBeInTheDocument();
  });

  it("apila el grafico y la leyenda cuando la tarjeta es angosta (xl)", async () => {
    renderWithProviders(<DashboardPage />, { usuario: ADMIN });
    await screen.findByText("Reclamos por categoría");

    // jsdom has no layout: the regression was the side-by-side row squeezing the
    // legend to one letter inside the 4-column card, so assert the stacking class.
    const leyenda = within(tarjetaCategorias()).getByText("Agua y cloacas");
    const contenido = leyenda.closest('[class*="min-[430px]:flex-row"]');
    expect(contenido?.className).toContain("xl:flex-col");
  });
});
