import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { FeedPublicoPage } from "./FeedPublicoPage";

function reclamo(id: string, titulo: string, barrio: string): ReclamoResumen {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.ALUMBRADO,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio,
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoResumen[]): Page<ReclamoResumen> {
  return { items, total: items.length, page: 1, size: 100 };
}

describe("FeedPublicoPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el feed que devuelve la API", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en Palermo", "Palermo"), reclamo("2", "Luz en Centro", "Centro")]),
    );

    renderWithProviders(<FeedPublicoPage />);

    expect(await screen.findByText("Bache en Palermo")).toBeInTheDocument();
    expect(screen.getByText("Luz en Centro")).toBeInTheDocument();
  });

  it("muestra el contador de reclamos visibles", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en Palermo", "Palermo"), reclamo("2", "Luz en Centro", "Centro")]),
    );

    renderWithProviders(<FeedPublicoPage />);

    expect(await screen.findByText("2 reclamos")).toBeInTheDocument();
  });

  it("al abrir un reclamo del feed, el detalle sabe que vino de Reclamos de la ciudad", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en Palermo", "Palermo")]),
    );

    function Detalle() {
      const { state } = useLocation();
      return <div>origen: {(state as { origen?: { label: string } } | null)?.origen?.label}</div>;
    }

    renderWithProviders(
      <Routes>
        <Route path="/" element={<FeedPublicoPage />} />
        <Route path="/reclamos/:id" element={<Detalle />} />
      </Routes>,
    );

    await userEvent.click(await screen.findByText("Bache en Palermo"));

    expect(await screen.findByText("origen: Reclamos de la ciudad")).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));

    renderWithProviders(<FeedPublicoPage />);

    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
    expect(screen.getByText("500 interno")).toBeInTheDocument();
  });
});
