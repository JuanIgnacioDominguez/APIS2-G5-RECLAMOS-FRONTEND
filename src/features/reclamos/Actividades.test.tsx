import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as actividadesApi from "@/api/actividades";
import type { ActividadOut, ActividadVinculada, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { etiquetaEstadoActividad, rutaReclamosDeActividad } from "./actividades";
import { AvisoActividadRelacionada, BadgeActividadRelacionada } from "./ActividadRelacionada";
import { ActividadesPanel, ListaActividades } from "./ActividadesPanel";
import { ReclamoCard } from "./ReclamoCard";

const vinculada: ActividadVinculada = {
  id: "act 1",
  titulo: "Festival de Primavera",
  inicio: "2026-11-01T15:00:00Z",
  fin: "2026-11-01T20:00:00Z",
};

function actividad(parcial: Partial<ActividadOut> = {}): ActividadOut {
  return {
    ...vinculada,
    capacidad: 5000,
    latitud: -34.5994,
    longitud: -58.3988,
    direccion: "Av. Rivadavia 1",
    espacio_nombre: "Plaza Houssay",
    estado: "PROGRAMADA",
    reclamos_relacionados: 7,
    ...parcial,
  };
}

const reclamo: ReclamoResumen = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  titulo: "Basura acumulada en la plaza",
  categoria: CategoriaReclamo.ALUMBRADO,
  prioridad: PrioridadReclamo.MEDIA,
  estado: EstadoReclamo.RECIBIDO,
  afecta_circulacion: false,
  bajo_alerta_climatica: false,
  alerta_nivel: null,
  actividad: vinculada,
  barrio: "Centro",
  latitud: null,
  longitud: null,
  adhesiones_count: 0,
  created_at: new Date().toISOString(),
};

describe("etiqueta de actividad en el reclamo", () => {
  it("el badge nombra la actividad y muestra el horario de Buenos Aires", () => {
    renderWithProviders(<BadgeActividadRelacionada actividad={vinculada} />);
    const badge = screen.getByText("Relacionado con: Festival de Primavera");
    expect(badge.closest("span[title]")).toHaveAttribute("title", "1/11 12:00 a 17:00");
  });

  it("el aviso del detalle linkea al listado filtrado por la actividad", () => {
    renderWithProviders(<AvisoActividadRelacionada actividad={vinculada} />);
    expect(screen.getByRole("note", { name: /actividad masiva/i })).toBeInTheDocument();
    expect(screen.getByText(/1\/11 12:00 a 17:00 \(hora de Buenos Aires\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver los reclamos/i })).toHaveAttribute(
      "href",
      rutaReclamosDeActividad("act 1"),
    );
    expect(rutaReclamosDeActividad("act 1")).toBe("/reclamos?actividad=act%201");
  });
});

describe("ReclamoCard con actividad", () => {
  it("el staff ve el badge", () => {
    renderWithProviders(<ReclamoCard reclamo={reclamo} mostrarActividad />);
    expect(screen.getByText("Relacionado con: Festival de Primavera")).toBeInTheDocument();
  });

  it("el vecino no lo ve", () => {
    renderWithProviders(<ReclamoCard reclamo={reclamo} />);
    expect(screen.queryByText(/relacionado con/i)).not.toBeInTheDocument();
  });

  it("sin actividad no muestra nada", () => {
    renderWithProviders(<ReclamoCard reclamo={{ ...reclamo, actividad: null }} mostrarActividad />);
    expect(screen.queryByText(/relacionado con/i)).not.toBeInTheDocument();
  });
});

describe("listado de actividades", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("traduce solo Cancelada y Suspendida; cualquier otro estado se muestra normal", () => {
    expect(etiquetaEstadoActividad("CANCELADA")).toBe("Cancelada");
    expect(etiquetaEstadoActividad("suspendida")).toBe("Suspendida");
    expect(etiquetaEstadoActividad("PROGRAMADA")).toBeNull();
  });

  it("muestra horario, lugar, conteo y etiquetas de estado", () => {
    renderWithProviders(
      <ListaActividades
        ahora={new Date("2026-11-01T16:00:00Z")}
        actividades={[
          actividad(),
          actividad({
            id: "act-2",
            titulo: "Feria",
            estado: "CANCELADA",
            reclamos_relacionados: 1,
            espacio_nombre: null,
            direccion: null,
          }),
        ]}
      />,
    );
    expect(screen.getByText("Festival de Primavera")).toBeInTheDocument();
    expect(screen.getByText(/1\/11 12:00 a 17:00 · Plaza Houssay/)).toBeInTheDocument();
    expect(screen.getByText("En curso")).toBeInTheDocument();
    expect(screen.getByText("7 reclamos relacionados")).toBeInTheDocument();
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
    expect(screen.getByText("1 reclamo relacionado")).toBeInTheDocument();
    // A cancelled activity is never "en curso".
    expect(screen.getAllByText("En curso")).toHaveLength(1);
  });

  it("el panel lista las actividades que devuelve la API", async () => {
    vi.spyOn(actividadesApi, "listarActividades").mockResolvedValue([actividad()]);
    renderWithProviders(<ActividadesPanel />);
    expect(await screen.findByText("Actividades masivas")).toBeInTheDocument();
    expect(screen.getByText("Festival de Primavera")).toBeInTheDocument();
  });

  it("el panel no aparece si no hay actividades ni si la API falla", async () => {
    const espia = vi.spyOn(actividadesApi, "listarActividades").mockResolvedValue([]);
    const { unmount } = renderWithProviders(<ActividadesPanel />);
    await vi.waitFor(() => expect(espia).toHaveBeenCalled());
    expect(screen.queryByText("Actividades masivas")).not.toBeInTheDocument();
    unmount();

    espia.mockRejectedValue(new Error("403"));
    renderWithProviders(<ActividadesPanel />);
    await vi.waitFor(() => expect(espia).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Actividades masivas")).not.toBeInTheDocument();
  });
});
