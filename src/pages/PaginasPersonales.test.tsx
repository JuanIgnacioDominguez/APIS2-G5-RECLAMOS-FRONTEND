import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoBandeja } from "@/api/types";
import {
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { CentroAyudaOperador } from "@/features/CentroAyudaOperador";
import { ADMIN, CIUDADANO, OPERADOR } from "@/test/usuarios";
import { AyudaPage } from "./AyudaPage";
import { ConfiguracionPage } from "./ConfiguracionPage";
import { CuentaPage } from "./CuentaPage";
import { NotificacionesPage } from "./NotificacionesPage";

function reclamoBandeja(
  id: string,
  estado: EstadoReclamo,
  origen: OrigenClasificacion,
): ReclamoBandeja {
  return {
    id,
    titulo: `Reclamo ${id}`,
    categoria: CategoriaReclamo.BACHES,
    origen_clasificacion: origen,
    prioridad: PrioridadReclamo.MEDIA,
    estado,
    adhesiones_count: 1,
    created_at: "2026-09-24T12:00:00.000Z",
  };
}

describe("paginas personales del sidebar", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("Mi cuenta muestra nombre, correo y rol", () => {
    renderWithProviders(<CuentaPage />, { usuario: CIUDADANO });
    expect(screen.getAllByText(CIUDADANO.nombre).length).toBeGreaterThan(0);
    expect(screen.getByText(CIUDADANO.email)).toBeInTheDocument();
    expect(screen.getAllByText("Ciudadano").length).toBeGreaterThan(0);
  });

  it.each([
    { rol: "operador", usuario: OPERADOR },
    { rol: "admin", usuario: ADMIN },
  ])("Mi cuenta muestra los KPI de bandeja al $rol", async ({ usuario }) => {
    const estadisticasSpy = vi.spyOn(reclamosApi, "estadisticas");
    const resueltosSpy = vi.spyOn(reclamosApi, "contarResueltos").mockResolvedValue(5);
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue({
      items: [
        reclamoBandeja("1", EstadoReclamo.RECIBIDO, OrigenClasificacion.MODELO),
        reclamoBandeja("2", EstadoReclamo.EN_REVISION, OrigenClasificacion.CIUDADANO),
        reclamoBandeja("3", EstadoReclamo.EN_REVISION, OrigenClasificacion.OPERADOR),
      ],
      total: 7,
      page: 1,
      size: 20,
    });

    renderWithProviders(<CuentaPage />, { usuario });

    expect(await screen.findByText("Resumen del modulo")).toBeInTheDocument();
    expect(screen.getByText("Entrantes")).toBeInTheDocument();
    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(screen.getByText("Recibidos")).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(2);
    expect(screen.getByText("En revision")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Resueltos")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Clasificados por IA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la bandeja" })).toBeInTheDocument();
    expect(estadisticasSpy).not.toHaveBeenCalled();
    expect(resueltosSpy).toHaveBeenCalledOnce();
  });

  it("mantiene los KPI de bandeja si falla el total de resueltos", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue({
      items: [reclamoBandeja("1", EstadoReclamo.RECIBIDO, OrigenClasificacion.MODELO)],
      total: 1,
      page: 1,
      size: 20,
    });
    vi.spyOn(reclamosApi, "contarResueltos").mockRejectedValue(
      new Error("Total de resueltos no disponible"),
    );

    renderWithProviders(<CuentaPage />, { usuario: OPERADOR });

    expect(await screen.findByText("Entrantes")).toBeInTheDocument();
    expect(screen.getByText("Recibidos")).toBeInTheDocument();
    expect(screen.getByText("Resueltos")).toBeInTheDocument();
    expect(screen.getByText("–")).toBeInTheDocument();
    expect(screen.queryByText(/No se pudo cargar el resumen/i)).not.toBeInTheDocument();
  });

  it("Notificaciones muestra el estado vacio", () => {
    renderWithProviders(<NotificacionesPage />);
    expect(screen.getByText("Sin novedades")).toBeInTheDocument();
  });

  it("Configuracion cambia el tema y lo persiste", async () => {
    renderWithProviders(<ConfiguracionPage />);
    await userEvent.click(screen.getByRole("button", { name: /oscuro/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: /claro/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("El centro de ayuda del operador muestra búsqueda y preguntas", async () => {
    renderWithProviders(<CentroAyudaOperador esAdmin={false} />);

    expect(screen.getByRole("heading", { name: "Centro de ayuda" })).toBeInTheDocument();
    expect(screen.getByText("Gestión de reclamos")).toBeInTheDocument();
    expect(screen.getByText("No se muestran datos personales de ciudadanos.")).toBeInTheDocument();
    expect(screen.getByTestId("ilustracion-ayuda")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bandeja" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Todos los reclamos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mapa" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notificaciones" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mi cuenta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configuración" })).toBeInTheDocument();
    expect(screen.queryByText("Panel y métricas")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Panel" })).not.toBeInTheDocument();
    expect(screen.queryByText(/soporte@/i)).not.toBeInTheDocument();

    const buscador = screen.getByRole("searchbox", { name: /buscar en el centro de ayuda/i });
    await userEvent.type(buscador, "mapa");

    expect(screen.getByText("¿Qué muestra el mapa?")).toBeInTheDocument();
  });

  it("Gestión de reclamos muestra sus propias guías", async () => {
    renderWithProviders(<CentroAyudaOperador esAdmin={false} />);

    await userEvent.click(screen.getByRole("button", { name: /gestión de reclamos/i }));

    expect(screen.getByText("¿Cómo asigno un reclamo?")).toBeInTheDocument();
    expect(screen.getByText("¿Qué estados puede tener un reclamo?")).toBeInTheDocument();
    expect(screen.getByText("¿Cómo corrijo la categoría o prioridad?")).toBeInTheDocument();
    expect(screen.queryByText("¿Cómo reviso los reclamos entrantes?")).not.toBeInTheDocument();
  });

  it("El centro de ayuda del admin incluye datos del Panel", () => {
    renderWithProviders(<CentroAyudaOperador esAdmin />);

    expect(screen.getAllByText("Panel y métricas").length).toBeGreaterThan(0);
    expect(screen.getByText("¿Qué datos muestra el Panel?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Panel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Atajo de teclado" })).toBeInTheDocument();
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("En macOS, usá Cmd + K.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Guías rápidas" })).not.toBeInTheDocument();
  });

  it("Ayuda explica todos los estados y prioridades", () => {
    renderWithProviders(<AyudaPage />);
    // "Recibido" and "Cerrado" also appear in the lifecycle strip/note, so a
    // single match is not guaranteed; assert at least one of each.
    expect(screen.getAllByText("Recibido").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cerrado").length).toBeGreaterThan(0);
    expect(screen.getByText("Critica")).toBeInTheDocument();
  });
});
