import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoDetalle, ReclamoSimilar } from "@/api/types";
import {
  CanalOrigen,
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ADMIN, CIUDADANO, OPERADOR } from "@/test/usuarios";
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

function renderDetalle(usuario: typeof CIUDADANO | null = null) {
  return renderWithProviders(
    <Routes>
      <Route path="/reclamos/:id" element={<ReclamoDetallePage />} />
    </Routes>,
    { route: `/reclamos/${detalle.id}`, usuario },
  );
}

describe("ReclamoDetallePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(reclamosApi, "obtenerReclamo").mockResolvedValue(detalle);
    // Staff detail loads possible duplicates; default to none so cases that do
    // not care about it are unaffected.
    vi.spyOn(reclamosApi, "similaresDe").mockResolvedValue([]);
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

    await userEvent.click(screen.getByRole("button", { name: /a mí también me pasa/i }));

    await waitFor(() => expect(screen.getByText("5 vecinos adheridos")).toBeInTheDocument());
    expect(reclamosApi.adherir).toHaveBeenCalledWith(detalle.id);
  });

  it("no ofrece adherir cuando el reclamo es del propio usuario", async () => {
    // The claim's ciudadano_id matches CIUDADANO.id, so it is the user's own.
    renderDetalle(CIUDADANO);
    await screen.findByText(detalle.titulo);

    expect(screen.queryByRole("button", { name: /a mí también me pasa/i })).not.toBeInTheDocument();
    expect(screen.getByText(/es tu reclamo/i)).toBeInTheDocument();
  });

  it.each([OPERADOR, ADMIN])(
    "muestra las herramientas de gestión al usuario %s",
    async (usuario) => {
      renderDetalle(usuario);
      await screen.findByRole("heading", { name: `Reclamo #${detalle.id.slice(0, 8)}` });

      expect(
        screen.queryByRole("button", { name: /a mí también me pasa/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Gestión del reclamo")).toBeInTheDocument();
      expect(screen.getByText("Clasificación")).toBeInTheDocument();
      expect(screen.getByText("Información del reclamo")).toBeInTheDocument();
      expect(screen.getByText("Trazabilidad")).toBeInTheDocument();
    },
  );

  it("muestra las fotos adjuntas con una acción para abrirlas", async () => {
    const foto = "https://cdn.citypass.local/evidencias/IMG_20260923_2054.jpg";
    vi.spyOn(reclamosApi, "obtenerReclamo").mockResolvedValue({
      ...detalle,
      fotos: [foto],
    });
    renderDetalle(OPERADOR);

    expect(
      await screen.findByRole("img", { name: /evidencia del reclamo: IMG_20260923_2054\.jpg/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("IMG_20260923_2054.jpg")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /descargar IMG_20260923_2054\.jpg/i })).toHaveAttribute(
      "href",
      foto,
    );
  });

  it("muestra un error si el reclamo no se puede cargar", async () => {
    vi.spyOn(reclamosApi, "obtenerReclamo").mockRejectedValue(new Error("404 no existe"));
    renderDetalle();
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });

  it("muestra posibles duplicados al staff cuando el backend los encuentra", async () => {
    const duplicado: ReclamoSimilar = {
      id: "dup-1",
      titulo: "Bache en la misma esquina",
      categoria: CategoriaReclamo.BACHES,
      prioridad: PrioridadReclamo.MEDIA,
      estado: EstadoReclamo.RECIBIDO,
      barrio: "Centro",
      latitud: -34.6,
      longitud: -58.4,
      adhesiones_count: 2,
      created_at: new Date().toISOString(),
      similitud: 0.72,
      distancia_metros: 30,
      terminos_en_comun: ["bache", "esquina"],
      es_propio: false,
      ya_adherido: false,
    };
    vi.spyOn(reclamosApi, "similaresDe").mockResolvedValue([duplicado]);

    renderDetalle(OPERADOR);
    await screen.findByRole("heading", { name: `Reclamo #${detalle.id.slice(0, 8)}` });

    expect(await screen.findByText(/posibles duplicados/i)).toBeInTheDocument();
    expect(screen.getByText("Bache en la misma esquina")).toBeInTheDocument();
  });
});
