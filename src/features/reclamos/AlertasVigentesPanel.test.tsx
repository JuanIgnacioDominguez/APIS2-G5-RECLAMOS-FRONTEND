import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import * as alertasApi from "@/api/alertas";
import type { AlertaClimaticaOut } from "@/api/types";
import { NivelCriticidad } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { AlertasVigentesPanel, ListaAlertasVigentes } from "./AlertasVigentesPanel";

function alerta(parcial: Partial<AlertaClimaticaOut> = {}): AlertaClimaticaOut {
  return {
    alerta_id: "a-1",
    nivel: NivelCriticidad.CRITICA,
    fenomeno: "TORMENTA_FUERTE",
    barrios: ["BARRIO DEMO ALERTA"],
    vigencia_desde: "2026-11-17T15:00:00Z",
    vigencia_hasta: "2026-11-20T15:04:00Z",
    estado: "CONFIRMADA",
    ...parcial,
  };
}

describe("ListaAlertasVigentes", () => {
  it("muestra nivel, fenomeno, barrios y hasta cuando rige", () => {
    render(<ListaAlertasVigentes alertas={[alerta()]} />);
    expect(screen.getByText("Crítica")).toBeInTheDocument();
    expect(screen.getByText("Tormenta fuerte")).toBeInTheDocument();
    expect(screen.getByText("Barrio Demo Alerta")).toBeInTheDocument();
    expect(screen.getByText("Hasta 20/11 12:04")).toBeInTheDocument();
  });

  it("resume los barrios cuando son muchos", () => {
    render(<ListaAlertasVigentes alertas={[alerta({ barrios: ["A", "B", "C", "D", "E"] })]} />);
    expect(screen.getByText("A, B, C y 2 más")).toBeInTheDocument();
  });

  it("avisa cuando la alerta llego solo con coordenadas", () => {
    render(<ListaAlertasVigentes alertas={[alerta({ barrios: [] })]} />);
    expect(screen.getByText("Zona definida por coordenadas")).toBeInTheDocument();
  });

  it("lista primero la alerta mas grave", () => {
    render(
      <ListaAlertasVigentes
        alertas={[
          alerta({ alerta_id: "1", nivel: NivelCriticidad.BAJA, fenomeno: "GRANIZO" }),
          alerta({ alerta_id: "2", nivel: NivelCriticidad.CRITICA, fenomeno: "TORMENTA_FUERTE" }),
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Tormenta fuerte");
    expect(items[1]).toHaveTextContent("Granizo");
  });
});

describe("AlertasVigentesPanel", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra el titulo con la cantidad", async () => {
    vi.spyOn(alertasApi, "listarAlertasActivas").mockResolvedValue([
      alerta(),
      alerta({ alerta_id: "a-2" }),
    ]);
    renderWithProviders(<AlertasVigentesPanel />);
    expect(await screen.findByText(/alertas climáticas vigentes \(2\)/i)).toBeInTheDocument();
  });

  it("no muestra nada si no hay alertas", async () => {
    const espia = vi.spyOn(alertasApi, "listarAlertasActivas").mockResolvedValue([]);
    renderWithProviders(<AlertasVigentesPanel />);
    await waitFor(() => expect(espia).toHaveBeenCalled());
    expect(screen.queryByText(/alertas climáticas vigentes/i)).not.toBeInTheDocument();
  });

  it("no rompe ni muestra nada si el pedido falla", async () => {
    const espia = vi.spyOn(alertasApi, "listarAlertasActivas").mockRejectedValue(new Error("boom"));
    renderWithProviders(<AlertasVigentesPanel />);
    await waitFor(() => expect(espia).toHaveBeenCalled());
    expect(screen.queryByText(/alertas climáticas vigentes/i)).not.toBeInTheDocument();
  });
});
