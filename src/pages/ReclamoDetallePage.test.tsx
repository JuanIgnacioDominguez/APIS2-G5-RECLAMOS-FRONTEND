import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoDetalle } from "@/api/types";
import {
  CanalOrigen,
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ReclamoDetallePage } from "./ReclamoDetallePage";

const detalle: ReclamoDetalle = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  ciudadano_id: "vecino-1",
  titulo: "Luminaria apagada en la plaza",
  descripcion: "Hace una semana que no funciona el alumbrado.",
  categoria: CategoriaReclamo.ALUMBRADO,
  prioridad: PrioridadReclamo.ALTA,
  estado: EstadoReclamo.EN_PROCESO,
  origen_clasificacion: OrigenClasificacion.MODELO,
  confianza_clasificacion: 0.9,
  canal: CanalOrigen.APP,
  direccion: "Rivadavia 800",
  barrio: "Centro",
  latitud: null,
  longitud: null,
  fotos: [],
  asignado_a: "operador-2",
  area_responsable: "Alumbrado",
  resolucion: null,
  adhesiones_count: 4,
  correlation_id: null,
  created_at: "2026-08-19T15:45:00Z",
  updated_at: "2026-08-19T16:00:00Z",
  resuelto_at: null,
  cerrado_at: null,
  historial: [
    {
      id: "h1",
      estado_anterior: null,
      estado_nuevo: EstadoReclamo.RECIBIDO,
      motivo: null,
      usuario_id: "vecino-1",
      created_at: "2026-08-19T15:45:00Z",
    },
    {
      id: "h2",
      estado_anterior: EstadoReclamo.RECIBIDO,
      estado_nuevo: EstadoReclamo.EN_PROCESO,
      motivo: "Cuadrilla asignada",
      usuario_id: "operador-2",
      created_at: "2026-08-19T16:00:00Z",
    },
  ],
  comentarios: [],
};

function renderDetalle() {
  return renderWithProviders(
    <Routes>
      <Route path="/reclamos/:id" element={<ReclamoDetallePage />} />
    </Routes>,
    { route: `/reclamos/${detalle.id}` },
  );
}

describe("ReclamoDetallePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(reclamosApi, "obtenerReclamo").mockResolvedValue(detalle);
  });

  it("muestra el titulo, los detalles y la trazabilidad", async () => {
    renderDetalle();
    expect(await screen.findByText(detalle.titulo)).toBeInTheDocument();
    expect(screen.getByText("operador-2")).toBeInTheDocument(); // asignado a
    expect(screen.getByText("4 vecinos adheridos")).toBeInTheDocument();
    expect(screen.getByText("Cuadrilla asignada")).toBeInTheDocument(); // motivo en timeline
  });

  it("registra una adhesion y actualiza el contador", async () => {
    vi.spyOn(reclamosApi, "adherir").mockResolvedValue({
      reclamo_id: detalle.id,
      adhesiones_count: 5,
    });
    renderDetalle();
    await screen.findByText(detalle.titulo);

    await userEvent.click(screen.getByRole("button", { name: /a mi tambien me pasa/i }));

    await waitFor(() => expect(screen.getByText("5 vecinos adheridos")).toBeInTheDocument());
    expect(reclamosApi.adherir).toHaveBeenCalledWith(detalle.id);
  });

  it("muestra un error si el reclamo no se puede cargar", async () => {
    vi.spyOn(reclamosApi, "obtenerReclamo").mockRejectedValue(new Error("404 no existe"));
    renderDetalle();
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
