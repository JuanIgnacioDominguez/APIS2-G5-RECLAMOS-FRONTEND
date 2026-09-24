import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoOut, ReclamoSimilar } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { NuevoReclamoPage } from "./NuevoReclamoPage";

function similar(over: Partial<ReclamoSimilar> = {}): ReclamoSimilar {
  return {
    id: "similar-1",
    titulo: "Poste de luz apagado",
    categoria: CategoriaReclamo.ALUMBRADO,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Almagro",
    latitud: -34.6033,
    longitud: -58.4201,
    adhesiones_count: 4,
    created_at: new Date().toISOString(),
    similitud: 0.61,
    distancia_metros: 50,
    terminos_en_comun: ["luz", "apagado"],
    es_propio: false,
    ya_adherido: false,
    ...over,
  };
}

function renderNuevo() {
  return renderWithProviders(
    <Routes>
      <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
      <Route path="/reclamos/:id" element={<div>detalle del reclamo</div>} />
    </Routes>,
    { route: "/reclamos/nuevo" },
  );
}

async function completarYEnviar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/titulo/i), "Bache profundo");
  await user.type(
    screen.getByLabelText(/descripcion/i),
    "Hay un bache peligroso hace varios dias.",
  );
  await user.click(screen.getByRole("button", { name: /enviar reclamo/i }));
}

describe("NuevoReclamoPage", () => {
  // `delay: null` types instantly instead of key-by-key, keeping the long-text
  // cases under the timeout on a loaded CI runner.
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.restoreAllMocks();
    user = userEvent.setup({ delay: null });
    // Default: no similar claims, so the base flow creates directly.
    vi.spyOn(reclamosApi, "buscarSimilares").mockResolvedValue([]);
  });

  it("sin reclamos parecidos, crea el reclamo y navega al detalle", async () => {
    vi.spyOn(reclamosApi, "crearReclamo").mockResolvedValue({ id: "nuevo-1" } as ReclamoOut);
    renderNuevo();

    await completarYEnviar(user);

    await waitFor(() => expect(screen.getByText("detalle del reclamo")).toBeInTheDocument());
    expect(reclamosApi.crearReclamo).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: "Bache profundo" }),
    );
  });

  it("si la busqueda de similares falla, crea igual (no bloquea al vecino)", async () => {
    vi.spyOn(reclamosApi, "buscarSimilares").mockRejectedValue(new Error("404 endpoint"));
    vi.spyOn(reclamosApi, "crearReclamo").mockResolvedValue({ id: "nuevo-2" } as ReclamoOut);
    renderNuevo();

    await completarYEnviar(user);

    await waitFor(() => expect(reclamosApi.crearReclamo).toHaveBeenCalled());
  });

  it("con parecidos, muestra el modal y 'sumarme' adhiere sin crear el reclamo", async () => {
    vi.spyOn(reclamosApi, "buscarSimilares").mockResolvedValue([similar()]);
    const crear = vi.spyOn(reclamosApi, "crearReclamo");
    vi.spyOn(reclamosApi, "adherir").mockResolvedValue({
      reclamo_id: "similar-1",
      adhesiones_count: 5,
    });
    renderNuevo();

    await completarYEnviar(user);

    expect(await screen.findByText(/es alguno de estos/i)).toBeInTheDocument();
    expect(screen.getByText(/coinciden: luz, apagado/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /es este, sumarme/i }));

    await waitFor(() => expect(screen.getByText("detalle del reclamo")).toBeInTheDocument());
    expect(reclamosApi.adherir).toHaveBeenCalledWith("similar-1");
    expect(crear).not.toHaveBeenCalled();
  });

  it("'cargar igual' crea el reclamo a pesar de los parecidos", async () => {
    vi.spyOn(reclamosApi, "buscarSimilares").mockResolvedValue([similar()]);
    vi.spyOn(reclamosApi, "crearReclamo").mockResolvedValue({ id: "nuevo-3" } as ReclamoOut);
    renderNuevo();

    await completarYEnviar(user);
    await screen.findByText(/es alguno de estos/i);

    await user.click(screen.getByRole("button", { name: /cargar igual/i }));

    await waitFor(() => expect(reclamosApi.crearReclamo).toHaveBeenCalled());
  });

  it("un parecido propio no ofrece el boton de sumarse", async () => {
    vi.spyOn(reclamosApi, "buscarSimilares").mockResolvedValue([similar({ es_propio: true })]);
    renderNuevo();

    await completarYEnviar(user);
    await screen.findByText(/es alguno de estos/i);

    expect(screen.getByText(/ya reportaste esto/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /es este, sumarme/i })).not.toBeInTheDocument();
  });
});
