import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { MapaPublicoPage } from "./MapaPublicoPage";

function reclamo(
  id: string,
  titulo: string,
  categoria: CategoriaReclamo,
  lat: number | null,
): ReclamoResumen {
  return {
    id,
    titulo,
    categoria,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: null,
    latitud: lat,
    longitud: lat === null ? null : -58.4,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoResumen[]): Page<ReclamoResumen> {
  return { items, total: items.length, page: 1, size: 100 };
}

describe("MapaPublicoPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra en el mapa solo los reclamos con coordenadas", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([
        reclamo("1", "Bache con ubicacion", CategoriaReclamo.BACHES, -34.6),
        reclamo("2", "Sin ubicacion", CategoriaReclamo.RESIDUOS, null),
      ]),
    );

    renderWithProviders(<MapaPublicoPage />);

    expect(await screen.findByText("Bache con ubicacion")).toBeInTheDocument();
    expect(screen.queryByText("Sin ubicacion")).not.toBeInTheDocument();
    expect(screen.getByText("1 en el mapa")).toBeInTheDocument();
  });

  it("filtra por categoria", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([
        reclamo("1", "Bache", CategoriaReclamo.BACHES, -34.6),
        reclamo("2", "Basural", CategoriaReclamo.RESIDUOS, -34.61),
      ]),
    );

    renderWithProviders(<MapaPublicoPage />);
    await screen.findByText("Bache");

    await userEvent.click(screen.getByRole("textbox", { name: /filtrar por categoria/i }));
    await userEvent.click(await screen.findByText("Residuos"));

    await waitFor(() => expect(screen.queryByText("Bache")).not.toBeInTheDocument());
    expect(screen.getByText("Basural")).toBeInTheDocument();
    expect(screen.getByText("1 en el mapa")).toBeInTheDocument();
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));
    renderWithProviders(<MapaPublicoPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
