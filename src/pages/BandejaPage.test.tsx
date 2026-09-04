import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoBandeja } from "@/api/types";
import {
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { BandejaPage } from "./BandejaPage";

function reclamo(id: string, titulo: string, origen: OrigenClasificacion): ReclamoBandeja {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.BACHES,
    origen_clasificacion: origen,
    prioridad: PrioridadReclamo.ALTA,
    estado: EstadoReclamo.RECIBIDO,
    adhesiones_count: 2,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoBandeja[]): Page<ReclamoBandeja> {
  return { items, total: items.length, page: 1, size: 20 };
}

describe("BandejaPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("lista los entrantes del endpoint de bandeja y marca los sugeridos por IA", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(
      page([
        reclamo("1", "Bache en la esquina", OrigenClasificacion.MODELO),
        reclamo("2", "Semaforo roto", OrigenClasificacion.CIUDADANO),
      ]),
    );

    renderWithProviders(<BandejaPage />);

    expect(await screen.findByText("Bache en la esquina")).toBeInTheDocument();
    expect(screen.getByText("Semaforo roto")).toBeInTheDocument();
    // El clasificado por el modelo muestra el badge "IA".
    expect(screen.getByText("IA")).toBeInTheDocument();
  });

  it("muestra el estado vacio cuando no hay entrantes", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(page([]));
    renderWithProviders(<BandejaPage />);
    expect(await screen.findByText(/no hay reclamos entrantes/i)).toBeInTheDocument();
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockRejectedValue(new Error("500 interno"));
    renderWithProviders(<BandejaPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
