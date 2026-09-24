import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import type { Estadisticas, Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ADMIN, OPERADOR } from "@/test/usuarios";
import { DashboardPage } from "./DashboardPage";

const estadisticas: Estadisticas = {
  total: 50,
  por_estado: [
    { clave: EstadoReclamo.RECIBIDO, cantidad: 10 },
    { clave: EstadoReclamo.EN_REVISION, cantidad: 5 },
    { clave: EstadoReclamo.ASIGNADO, cantidad: 3 },
    { clave: EstadoReclamo.EN_PROCESO, cantidad: 4 },
    { clave: EstadoReclamo.RESUELTO, cantidad: 20 },
    { clave: EstadoReclamo.CERRADO, cantidad: 8 },
  ],
  por_categoria: [
    { clave: CategoriaReclamo.ALUMBRADO, cantidad: 30 },
    { clave: CategoriaReclamo.BACHES, cantidad: 20 },
  ],
  por_prioridad: [
    { clave: PrioridadReclamo.CRITICA, cantidad: 4 },
    { clave: PrioridadReclamo.BAJA, cantidad: 46 },
  ],
  tiempo_resolucion_horas_promedio: 18,
};

function reclamo(id: string, cambios: Partial<ReclamoResumen> = {}): ReclamoResumen {
  return {
    id,
    titulo: `Reclamo ${id}`,
    categoria: CategoriaReclamo.ALUMBRADO,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: "2026-09-23T12:00:00Z",
    ...cambios,
  };
}

const recientes: Page<ReclamoResumen> = {
  items: [
    reclamo("abc12345-0000-0000-0000-000000000001", {
      titulo: "Luz fundida en la plaza",
      estado: EstadoReclamo.ASIGNADO,
      prioridad: PrioridadReclamo.ALTA,
      latitud: -34.6037,
      longitud: -58.3816,
    }),
    reclamo("def67890-0000-0000-0000-000000000002", {
      titulo: "Bache en la avenida",
      categoria: CategoriaReclamo.BACHES,
      barrio: null,
    }),
  ],
  total: 120,
  page: 1,
  size: 100,
};

describe("DashboardPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra metricas globales y recientes reales para admin", async () => {
    const spyEstadisticas = vi.spyOn(reclamosApi, "estadisticas").mockResolvedValue(estadisticas);
    const spyReclamos = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(recientes);

    renderWithProviders(<DashboardPage />, { usuario: ADMIN });

    expect(await screen.findByText("Reclamos totales")).toBeInTheDocument();
    const totalCard = screen
      .getByText("Reclamos totales")
      .closest<HTMLElement>('[data-slot="card"]')!;
    const pendientesCard = screen
      .getByText("Pendientes de asignación")
      .closest<HTMLElement>('[data-slot="card"]')!;
    const resueltosCard = screen.getByText("Resueltos").closest<HTMLElement>('[data-slot="card"]')!;
    expect(within(totalCard).getByText("50")).toBeInTheDocument();
    expect(within(pendientesCard).getByText("15")).toBeInTheDocument();
    expect(within(resueltosCard).getByText("28")).toBeInTheDocument();
    expect(screen.getByText("18 h")).toBeInTheDocument();
    expect(screen.getByText("Datos globales")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /mapa de reclamos geolocalizados/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 de 2 reclamos cargados tienen coordenadas.")).toBeInTheDocument();
    expect(screen.queryByText("Canales de ingreso")).not.toBeInTheDocument();
    expect(screen.queryByText("Tareas del operador")).not.toBeInTheDocument();
    expect(spyEstadisticas).toHaveBeenCalledOnce();
    expect(spyReclamos).toHaveBeenCalledWith({ orden: "recientes", page: 1, size: 100 });
  });

  it("usa la muestra reciente y el total global de resueltos para operador", async () => {
    const spyEstadisticas = vi.spyOn(reclamosApi, "estadisticas");
    const spyResueltos = vi.spyOn(reclamosApi, "contarResueltos").mockResolvedValue(6);
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      items: recientes.items,
      total: 2,
      page: 1,
      size: 100,
    });

    renderWithProviders(<DashboardPage />, { usuario: OPERADOR });

    expect(await screen.findByText("Reclamos recientes")).toBeInTheDocument();
    const recientesCard = screen
      .getByText("Reclamos recientes")
      .closest<HTMLElement>('[data-slot="card"]')!;
    const resueltosCard = screen.getByText("Resueltos").closest<HTMLElement>('[data-slot="card"]')!;
    expect(screen.getByText("Muestra reciente")).toBeInTheDocument();
    expect(within(recientesCard).getByText("2")).toBeInTheDocument();
    expect(within(resueltosCard).getByText("6")).toBeInTheDocument();
    expect(screen.queryByText("Reclamos totales")).not.toBeInTheDocument();
    expect(spyEstadisticas).not.toHaveBeenCalled();
    expect(spyResueltos).toHaveBeenCalledOnce();
  });

  it("muestra un error recuperable cuando no se pueden cargar los reclamos", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("Error de red"));
    vi.spyOn(reclamosApi, "contarResueltos").mockResolvedValue(0);

    renderWithProviders(<DashboardPage />, { usuario: OPERADOR });

    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
