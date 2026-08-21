import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ReclamosPage } from "./ReclamosPage";

function reclamo(id: string, titulo: string): ReclamoResumen {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.ALUMBRADO,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoResumen[]): Page<ReclamoResumen> {
  return { items, total: items.length, page: 1, size: 20 };
}

describe("ReclamosPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza la lista que devuelve la API", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina"), reclamo("2", "Ruido nocturno")]),
    );

    renderWithProviders(<ReclamosPage />);

    expect(await screen.findByText("Bache en la esquina")).toBeInTheDocument();
    expect(screen.getByText("Ruido nocturno")).toBeInTheDocument();
  });

  it("filtra por texto en el cliente", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina"), reclamo("2", "Ruido nocturno")]),
    );

    renderWithProviders(<ReclamosPage />);
    await screen.findByText("Bache en la esquina");

    await userEvent.type(screen.getByPlaceholderText(/buscar por titulo/i), "ruido");

    await waitFor(() => expect(screen.queryByText("Bache en la esquina")).not.toBeInTheDocument());
    expect(screen.getByText("Ruido nocturno")).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));

    renderWithProviders(<ReclamosPage />);

    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
    expect(screen.getByText("500 interno")).toBeInTheDocument();
  });

  it("muestra el estado vacio cuando no hay reclamos", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(page([]));

    renderWithProviders(<ReclamosPage />);

    expect(await screen.findByText(/no hay reclamos/i)).toBeInTheDocument();
  });
});
