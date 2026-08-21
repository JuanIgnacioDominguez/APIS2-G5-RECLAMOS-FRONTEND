import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "./Badges";

describe("badges de reclamo", () => {
  it("muestra la etiqueta del estado", () => {
    renderWithProviders(<EstadoBadge estado={EstadoReclamo.EN_PROCESO} />);
    expect(screen.getByText("En proceso")).toBeInTheDocument();
  });

  it("muestra la etiqueta de la prioridad", () => {
    renderWithProviders(<PrioridadBadge prioridad={PrioridadReclamo.CRITICA} />);
    expect(screen.getByText("Critica")).toBeInTheDocument();
  });

  it("muestra la etiqueta de la categoria", () => {
    renderWithProviders(<CategoriaBadge categoria={CategoriaReclamo.ALUMBRADO} />);
    expect(screen.getByText("Alumbrado")).toBeInTheDocument();
  });
});
