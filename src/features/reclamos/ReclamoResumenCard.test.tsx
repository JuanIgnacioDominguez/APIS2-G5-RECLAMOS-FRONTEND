import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import type { ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ReclamoResumenCard } from "./ReclamoResumenCard";

const reclamo: ReclamoResumen = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  titulo: "Luminaria apagada en la plaza",
  categoria: CategoriaReclamo.ALUMBRADO,
  prioridad: PrioridadReclamo.ALTA,
  estado: EstadoReclamo.EN_REVISION,
  barrio: "Centro",
  latitud: null,
  longitud: null,
  adhesiones_count: 3,
  created_at: new Date().toISOString(),
};

describe("ReclamoResumenCard", () => {
  it("muestra la clasificación, el estado y los datos resumidos", () => {
    renderWithProviders(<ReclamoResumenCard reclamo={reclamo} esPropio />);

    expect(screen.getByTestId("reclamo-resumen-card")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Clasificación" })).toBeInTheDocument();
    expect(screen.getByText("Estado actual")).toBeInTheDocument();
    expect(screen.getByText("En revision")).toBeInTheDocument();
    expect(screen.getByText("Alumbrado")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("3 adhesiones")).toBeInTheDocument();
    expect(screen.getByText("Tuyo")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: reclamo.titulo })).not.toBeInTheDocument();
    expect(screen.queryByText("#a1b2c3d4")).not.toBeInTheDocument();
  });
});
