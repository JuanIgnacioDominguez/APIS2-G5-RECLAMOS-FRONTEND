import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import type { ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ReclamoCard } from "./ReclamoCard";

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

describe("ReclamoCard", () => {
  it("muestra titulo, barrio, estado y adhesiones", () => {
    renderWithProviders(<ReclamoCard reclamo={reclamo} />);
    expect(screen.getByText(reclamo.titulo)).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("En revision")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("#a1b2c3d4")).toBeInTheDocument();
  });

  it("muestra 'Sin barrio' cuando no hay barrio", () => {
    renderWithProviders(
      <ReclamoCard reclamo={{ ...reclamo, barrio: null, adhesiones_count: 0 }} />,
    );
    expect(screen.getByText("Sin barrio")).toBeInTheDocument();
  });
});
