import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoListado } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { CIUDADANO, OPERADOR } from "@/test/usuarios";
import { ReclamosPage } from "./ReclamosPage";

function reclamo(id: string, titulo: string, esPropio: boolean | null = true): ReclamoListado {
  const base = {
    id,
    titulo,
    categoria: CategoriaReclamo.ALUMBRADO,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
  return (esPropio === null ? base : { ...base, es_propio: esPropio }) as ReclamoListado;
}

function page(items: ReclamoListado[]): Page<ReclamoListado> {
  return { items, total: items.length, page: 1, size: 20 };
}

describe("ReclamosPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza la lista que devuelve la API", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina"), reclamo("2", "Ruido nocturno")]),
    );

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });

    expect(await screen.findByText("Bache en la esquina")).toBeInTheDocument();
    expect(screen.getByText("Ruido nocturno")).toBeInTheDocument();
  });

  it("filtra por texto en el cliente", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina"), reclamo("2", "Ruido nocturno")]),
    );

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });
    await screen.findByText("Bache en la esquina");

    await userEvent.type(screen.getByPlaceholderText(/buscar por titulo/i), "ruido");

    await waitFor(() => expect(screen.queryByText("Bache en la esquina")).not.toBeInTheDocument());
    expect(screen.getByText("Ruido nocturno")).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });

    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
    expect(screen.getByText("500 interno")).toBeInTheDocument();
  });

  it("muestra el estado vacio cuando no hay reclamos", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(page([]));

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });

    expect(await screen.findByText(/no hay reclamos/i)).toBeInTheDocument();
  });

  it("filtra en el cliente los reclamos que no son del ciudadano", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache propio"), reclamo("2", "Reclamo de otro vecino", false)]),
    );

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });

    expect(await screen.findByText("Bache propio")).toBeInTheDocument();
    expect(screen.queryByText("Reclamo de otro vecino")).not.toBeInTheDocument();
  });

  it("un ciudadano usa la lista unificada y no pide un endpoint filtrado", async () => {
    const spy = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(page([]));

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({
        size: 100,
        orden: "recientes",
      }),
    );
  });

  it("usa fallback si el backend activo todavía no devuelve es_propio", async () => {
    const spy = vi
      .spyOn(reclamosApi, "listarReclamos")
      .mockImplementation(async (filtro) =>
        filtro?.ciudadano_id
          ? page([reclamo("mio", "Reclamo propio", null)])
          : page([reclamo("publico", "Reclamo de la ciudad", null)]),
      );

    renderWithProviders(<ReclamosPage />, { usuario: CIUDADANO });

    expect(await screen.findByText("Reclamo propio")).toBeInTheDocument();
    expect(screen.queryByText("Reclamo de la ciudad")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({
        ciudadano_id: CIUDADANO.id,
        size: 100,
        orden: "recientes",
      }),
    );
  });

  it("el staff pide todos los reclamos, sin filtrar por ciudadano", async () => {
    const spy = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(page([]));

    renderWithProviders(<ReclamosPage />, { usuario: OPERADOR });

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ size: 100, orden: "recientes" }));
  });
});
