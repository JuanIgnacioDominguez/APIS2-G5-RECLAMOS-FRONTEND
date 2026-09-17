import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { AppLayout } from "./AppLayout";

function reclamo(id: string, titulo: string): ReclamoResumen {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.BACHES,
    prioridad: PrioridadReclamo.ALTA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoResumen[]): Page<ReclamoResumen> {
  return { items, total: items.length, page: 1, size: 6 };
}

function renderLayout(ruta = "/reclamos") {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/reclamos" element={<div>contenido de reclamos</div>} />
        <Route path="/reclamos/:id" element={<div>detalle del reclamo</div>} />
      </Route>
    </Routes>,
    { route: ruta, usuario: CIUDADANO },
  );
}

describe("AppLayout", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra el menu del ciudadano (solo reclamos)", () => {
    renderLayout();
    expect(screen.getByRole("link", { name: /mis reclamos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /nuevo reclamo/i })).toBeInTheDocument();
    // Otros modulos no pertenecen a este sistema.
    expect(screen.queryByRole("link", { name: /movilidad/i })).not.toBeInTheDocument();
  });

  it("renderiza el contenido de la ruta hija y la barra de busqueda", () => {
    renderLayout();
    expect(screen.getByText("contenido de reclamos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar reclamos/i)).toBeInTheDocument();
  });

  it("muestra el usuario autenticado y su rol", () => {
    renderLayout();
    expect(screen.getByText(CIUDADANO.nombre)).toBeInTheDocument();
    expect(screen.getByText("Ciudadano")).toBeInTheDocument();
  });

  it("busca reclamos en el header y navega al elegir un resultado", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina")]),
    );

    renderLayout();
    await userEvent.type(screen.getByPlaceholderText(/buscar reclamos/i), "bache");

    const opcion = await screen.findByRole(
      "option",
      { name: /bache en la esquina/i },
      { timeout: 2000 },
    );
    await userEvent.click(opcion);

    expect(await screen.findByText("detalle del reclamo")).toBeInTheDocument();
  });

  it("no busca con menos de dos letras", async () => {
    const spy = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(page([]));
    renderLayout();

    await userEvent.type(screen.getByPlaceholderText(/buscar reclamos/i), "b");
    expect(await screen.findByText(/al menos 2 letras/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });
});
