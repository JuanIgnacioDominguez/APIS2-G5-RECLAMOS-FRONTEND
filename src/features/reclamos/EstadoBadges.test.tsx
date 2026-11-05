import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import {
  CategoriaBadge,
  CirculacionBadge,
  EstadoBadge,
  IaBadge,
  PrioridadBadge,
} from "./EstadoBadges";

describe("badges de reclamo", () => {
  it("muestra la etiqueta del estado con el contraste del tema", () => {
    renderWithProviders(<EstadoBadge estado={EstadoReclamo.EN_PROCESO} />);
    const badge = screen.getByText("En proceso");
    expect(badge.style.color).toBe("var(--status-progress-on)");
    expect(badge.style.textShadow).toBe("var(--status-shadow)");
  });

  it("muestra la etiqueta de la prioridad", () => {
    renderWithProviders(<PrioridadBadge prioridad={PrioridadReclamo.CRITICA} />);
    expect(screen.getByText("Critica")).toBeInTheDocument();
  });

  it("muestra la etiqueta de la categoria", () => {
    renderWithProviders(<CategoriaBadge categoria={CategoriaReclamo.ALUMBRADO} />);
    expect(screen.getByText("Alumbrado")).toBeInTheDocument();
  });

  it("muestra la etiqueta de clasificacion por IA", () => {
    renderWithProviders(<IaBadge />);
    expect(screen.getByText("IA")).toBeInTheDocument();
  });

  it("muestra que el reclamo afecta la circulacion", () => {
    renderWithProviders(<CirculacionBadge />);
    expect(screen.getByText("Afecta circulación")).toBeInTheDocument();
  });

  it("la version compacta conserva el texto accesible", () => {
    renderWithProviders(<CirculacionBadge compacto />);
    expect(screen.getByRole("img", { name: "Afecta la circulación" })).toBeInTheDocument();
    expect(screen.queryByText("Afecta circulación")).not.toBeInTheDocument();
  });
});
