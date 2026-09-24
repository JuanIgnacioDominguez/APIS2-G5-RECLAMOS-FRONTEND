import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import { ApiError } from "@/api/client";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as notificacionesApi from "@/api/notificaciones";
import * as reclamosApi from "@/api/reclamos";
import type { Notificacion, Page, ReclamoListado } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import type { Usuario } from "@/auth/users";
import { renderWithProviders } from "@/test/render";
import { CIUDADANO, OPERADOR } from "@/test/usuarios";
import { AppLayout } from "./AppLayout";

function reclamo(id: string, titulo: string): ReclamoListado {
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
    es_propio: false,
  };
}

function page(items: ReclamoListado[]): Page<ReclamoListado> {
  return { items, total: items.length, page: 1, size: 6 };
}

function notificacion(id: string, leida = false): Notificacion {
  return {
    id,
    tipo: "ESTADO",
    reclamo_id: `reclamo-${id}`,
    titulo: `Actualización del reclamo ${id}`,
    mensaje: "Tu reclamo cambió de estado.",
    created_at: new Date().toISOString(),
    leida,
    leida_at: leida ? new Date().toISOString() : null,
  };
}

function renderLayout(ruta = "/reclamos", usuario: Usuario = CIUDADANO) {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<div>contenido del dashboard</div>} />
        <Route path="/reclamos" element={<div>contenido de reclamos</div>} />
        <Route path="/reclamos/nuevo" element={<div>formulario de reclamo</div>} />
        <Route path="/reclamos/:id" element={<div>detalle del reclamo</div>} />
        <Route path="/mapa" element={<div>mapa de reclamos</div>} />
        <Route path="/notificaciones" element={<div>bandeja de notificaciones</div>} />
      </Route>
    </Routes>,
    { route: ruta, usuario },
  );
}

function mainDeContenido(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[data-slot="sidebar-inset"] > main')!;
}

async function abrirBusqueda(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: /buscar reclamos/i }));
  return screen.findByPlaceholderText(/buscar reclamos o ir a una pagina/i);
}

describe("AppLayout", () => {
  it("detiene el polling de notificaciones cuando la ruta no existe", async () => {
    vi.useFakeTimers();
    try {
      const contar = vi
        .mocked(notificacionesApi.contarNotificaciones)
        .mockRejectedValue(new ApiError(404, "No disponible"));
      renderLayout();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(contar).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000);
      });
      expect(contar).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("abre el menu movil y lo cierra al navegar o pulsar Escape", async () => {
    vi.stubGlobal("innerWidth", 390);
    try {
      renderLayout();
      await userEvent.click(screen.getByRole("button", { name: "Abrir o cerrar menú" }));
      const menu = await screen.findByRole("dialog", { name: "Menú principal" });
      expect(within(menu).getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();
      await userEvent.click(within(menu).getByRole("link", { name: "Mapa" }));
      expect(await screen.findByText("mapa de reclamos")).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Abrir o cerrar menú" }));
      await screen.findByRole("dialog", { name: "Menú principal" });
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    } finally {
      vi.unstubAllGlobals();
    }
  });
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(notificacionesApi, "contarNotificaciones").mockResolvedValue({ unread_count: 0 });
  });

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

  it("muestra Dashboard en el menu del operador", () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });
    const { container } = renderLayout("/dashboard", OPERADOR);
    const nav = within(container.querySelector<HTMLElement>('[data-slot="sidebar-content"]')!);

    expect(nav.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: /bandeja/i })).toBeInTheDocument();
    expect(nav.queryByRole("link", { name: /panel/i })).not.toBeInTheDocument();
  });

  it("renderiza el contenido de la ruta hija y el acceso a la busqueda", () => {
    renderLayout();
    expect(screen.getByText("contenido de reclamos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscar reclamos/i })).toBeInTheDocument();
  });

  it("iguala el ancho y padding de las paginas, excepto el mapa", () => {
    const pagina = renderLayout("/reclamos/nuevo");
    const mainPagina = mainDeContenido(pagina.container);

    expect(mainPagina).toHaveClass("p-4", "sm:p-6");
    expect(mainPagina.firstElementChild).toHaveClass("mx-auto", "w-full", "max-w-7xl");
    pagina.unmount();

    const mapa = renderLayout("/mapa");
    const mainMapa = mainDeContenido(mapa.container);

    expect(mainMapa).toHaveClass("p-0");
    expect(mainMapa.querySelector(".max-w-7xl")).not.toBeInTheDocument();
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

  it("muestra el punto rojo cuando hay notificaciones sin leer", async () => {
    vi.spyOn(notificacionesApi, "contarNotificaciones").mockResolvedValue({ unread_count: 2 });
    renderLayout();

    expect(await screen.findByTestId("notificaciones-no-leidas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notificaciones: 2 sin leer" })).toBeInTheDocument();
  });

  it("muestra la preview de notificaciones recientes en la campana", async () => {
    vi.spyOn(notificacionesApi, "listarNotificaciones").mockResolvedValue({
      items: [notificacion("1"), notificacion("2"), notificacion("3", true)],
      total: 3,
      page: 1,
      size: 3,
      unread_count: 2,
    });
    renderLayout();

    await userEvent.click(screen.getByRole("button", { name: "Notificaciones" }));

    expect(await screen.findByText("Actualización del reclamo 1")).toBeInTheDocument();
    expect(screen.getByText("Actualización del reclamo 2")).toBeInTheDocument();
    expect(screen.getByText("Actualización del reclamo 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver todas" })).toBeInTheDocument();
  });

  it("navega a la bandeja desde Ver todas", async () => {
    vi.spyOn(notificacionesApi, "listarNotificaciones").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 3,
      unread_count: 0,
    });
    renderLayout();

    await userEvent.click(screen.getByRole("button", { name: "Notificaciones" }));
    await userEvent.click(await screen.findByRole("button", { name: "Ver todas" }));

    expect(await screen.findByText("bandeja de notificaciones")).toBeInTheDocument();
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
