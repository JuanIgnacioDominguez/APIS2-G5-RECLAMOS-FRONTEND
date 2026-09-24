import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Route, Routes } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoListado } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { FeedPublicoPage } from "./FeedPublicoPage";
import { ReclamosPage } from "./ReclamosPage";

function reclamo(id: string, titulo: string, esPropio: boolean): ReclamoListado {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.BACHES,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: "2026-09-24T12:00:00.000Z",
    es_propio: esPropio,
  };
}

function respuesta(items: ReclamoListado[]): Page<ReclamoListado> {
  return { items, total: items.length, page: 1, size: 100 };
}

describe("cache compartida de reclamos", () => {
  it("filtra Mis reclamos desde la misma lista ya cargada", async () => {
    const listar = vi
      .spyOn(reclamosApi, "listarReclamos")
      .mockResolvedValue(
        respuesta([
          reclamo("mio", "Reclamo propio", true),
          reclamo("publico", "Reclamo de la ciudad", false),
        ]),
      );

    renderWithProviders(
      <>
        <nav>
          <Link to="/feed">Ir al feed</Link>
          <Link to="/reclamos">Ir a mis reclamos</Link>
        </nav>
        <Routes>
          <Route path="/feed" element={<FeedPublicoPage />} />
          <Route path="/reclamos" element={<ReclamosPage />} />
        </Routes>
      </>,
      { route: "/feed", usuario: CIUDADANO },
    );

    expect(await screen.findByText("Reclamo de la ciudad")).toBeInTheDocument();
    expect(screen.getByText("Reclamo propio")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "Ir a mis reclamos" }));

    expect(await screen.findByText("Reclamo propio")).toBeInTheDocument();
    expect(screen.queryByText("Reclamo de la ciudad")).not.toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(1);
  });
});
