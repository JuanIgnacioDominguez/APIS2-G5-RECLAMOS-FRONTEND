import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { BandejaPage } from "./BandejaPage";

function reclamo(id: string, titulo: string, estado: EstadoReclamo): ReclamoResumen {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.BACHES,
    prioridad: PrioridadReclamo.ALTA,
    estado,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 2,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoResumen[]): Page<ReclamoResumen> {
  return { items, total: items.length, page: 1, size: 20 };
}

describe("BandejaPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra solo los entrantes por defecto y todos al cambiar el filtro", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(
      page([
        reclamo("1", "Bache en la esquina", EstadoReclamo.RECIBIDO),
        reclamo("2", "Reclamo resuelto", EstadoReclamo.RESUELTO),
      ]),
    );

    renderWithProviders(<BandejaPage />);

    expect(await screen.findByText("Bache en la esquina")).toBeInTheDocument();
    expect(screen.queryByText("Reclamo resuelto")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: "Todos" }));
    await waitFor(() => expect(screen.getByText("Reclamo resuelto")).toBeInTheDocument());
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));
    renderWithProviders(<BandejaPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
