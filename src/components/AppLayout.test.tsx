import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
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

async function abrirBusqueda(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: /buscar reclamos/i }));
  return screen.findByPlaceholderText(/buscar reclamos por titulo/i);
}

describe("AppLayout", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra el menu del ciudadano (solo reclamos)", () => {
    const { container } = renderLayout();
    // Scope to the sidebar: the header breadcrumb also exposes the current
    // page as a link, so query only inside the navigation menu.
    const nav = within(container.querySelector<HTMLElement>('[data-slot="sidebar-content"]')!);
    expect(nav.getByRole("link", { name: /mis reclamos/i })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: /reclamos de la ciudad/i })).toBeInTheDocument();
    // "Nuevo reclamo" ya no vive en el sidebar (es un boton en Mis reclamos).
    expect(nav.queryByRole("link", { name: /nuevo reclamo/i })).not.toBeInTheDocument();
    expect(nav.queryByRole("link", { name: /movilidad/i })).not.toBeInTheDocument();
  });

  it("renderiza el contenido de la ruta hija y el acceso a la busqueda", () => {
    renderLayout();
    expect(screen.getByText("contenido de reclamos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscar reclamos/i })).toBeInTheDocument();
  });

  it("muestra el usuario autenticado y su rol", () => {
    renderLayout();
    const cuenta = within(screen.getByRole("button", { name: /cuenta/i }));
    expect(cuenta.getByText(CIUDADANO.nombre)).toBeInTheDocument();
    expect(cuenta.getByText("Ciudadano")).toBeInTheDocument();
  });

  it("muestra el rol tambien en el pie del sidebar", () => {
    const { container } = renderLayout();
    const pie = within(container.querySelector<HTMLElement>('[data-slot="sidebar-footer"]')!);
    expect(pie.getByText("Ciudadano")).toBeInTheDocument();
  });

  it("busca reclamos y navega al elegir un resultado", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina")]),
    );

    renderLayout();
    const input = await abrirBusqueda();
    await userEvent.type(input, "bache");

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

    const input = await abrirBusqueda();
    await userEvent.type(input, "b");
    expect(await screen.findByText(/al menos 2 letras/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });
});
