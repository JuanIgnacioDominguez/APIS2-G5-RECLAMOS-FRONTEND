import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { limpiarCacheAsync } from "@/hooks/useAsync";
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
  beforeEach(() => {
    limpiarCacheAsync();
  });

  it("muestra en el mapa solo los reclamos con coordenadas", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([
        reclamo("1", "Bache con ubicacion", CategoriaReclamo.BACHES, -34.6),
        reclamo("2", "Sin ubicacion", CategoriaReclamo.RESIDUOS, null),
      ]),
    );

    const { container } = renderWithProviders(<MapaPublicoPage />);

    expect(container.querySelector('[data-slot="mapa-publico"]')).not.toHaveClass(
      "-m-4",
      "sm:-m-6",
    );
    expect(await screen.findByText("Bache con ubicacion")).toBeInTheDocument();
    expect(screen.queryByText("Sin ubicacion")).not.toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "1 reclamo en el mapa"),
    ).toBeInTheDocument();
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

    await userEvent.click(screen.getByRole("combobox", { name: /filtrar por categoria/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Residuos" }));

    await waitFor(() => expect(screen.queryByText("Bache")).not.toBeInTheDocument());
    expect(screen.getByText("Basural")).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "1 reclamo en el mapa"),
    ).toBeInTheDocument();
  });

  it("deduplica la carga inicial en modo estricto", async () => {
    let resolver!: (value: Page<ReclamoResumen>) => void;
    const request = new Promise<Page<ReclamoResumen>>((resolve) => {
      resolver = resolve;
    });
    const listar = vi.spyOn(reclamosApi, "listarReclamos").mockReturnValue(request);

    const vista = renderWithProviders(
      <StrictMode>
        <MapaPublicoPage />
      </StrictMode>,
    );

    await waitFor(() => expect(listar).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolver(page([]));
      await request;
    });
    vista.unmount();
  });

  it("muestra al instante los reclamos guardados al volver al mapa", async () => {
    let resolver!: (value: Page<ReclamoResumen>) => void;
    const revalidacion = new Promise<Page<ReclamoResumen>>((resolve) => {
      resolver = resolve;
    });
    const listar = vi
      .spyOn(reclamosApi, "listarReclamos")
      .mockResolvedValueOnce(page([reclamo("1", "Bache", CategoriaReclamo.BACHES, -34.6)]))
      .mockReturnValueOnce(revalidacion);

    const primeraCarga = renderWithProviders(<MapaPublicoPage />);
    expect(await screen.findByText("Bache")).toBeInTheDocument();
    primeraCarga.unmount();

    const segundaCarga = renderWithProviders(<MapaPublicoPage />);

    expect(screen.getByText("Bache")).toBeInTheDocument();
    expect(screen.queryByText("Cargando mapa...")).not.toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(2);
    await act(async () => {
      resolver(page([reclamo("1", "Bache", CategoriaReclamo.BACHES, -34.6)]));
      await revalidacion;
    });
    segundaCarga.unmount();
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));
    renderWithProviders(<MapaPublicoPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
