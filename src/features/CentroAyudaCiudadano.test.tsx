import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render";
import { CentroAyudaCiudadano } from "./CentroAyudaCiudadano";

describe("CentroAyudaCiudadano", () => {
  it("muestra la estructura del centro de ayuda admin para vecinos", () => {
    renderWithProviders(<CentroAyudaCiudadano />);

    expect(screen.getByRole("heading", { name: "Centro de ayuda" })).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: /buscar en el centro de ayuda/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Empezá en cuatro pasos")).toBeInTheDocument();
    expect(screen.getByTestId("ilustracion-ayuda")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nuevo reclamo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notificaciones" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configuración" })).toBeInTheDocument();
  });

  it("busca preguntas por texto y permite limpiar la consulta", async () => {
    renderWithProviders(<CentroAyudaCiudadano />);

    const buscador = screen.getByRole("searchbox", {
      name: /buscar en el centro de ayuda/i,
    });

    await userEvent.type(buscador, "mapa");

    expect(screen.getByText("¿Qué muestra el mapa?")).toBeInTheDocument();
    expect(screen.queryByText("¿Cómo cargo un reclamo?")).not.toBeInTheDocument();

    await userEvent.clear(buscador);
    expect(screen.getByText("¿Cómo cargo un reclamo?")).toBeInTheDocument();

    await userEvent.type(buscador, "   ");
    expect(
      screen.getByText("Respuestas rápidas para cuidar y seguir tu reclamo."),
    ).toBeInTheDocument();

    await userEvent.clear(buscador);
    await userEvent.type(buscador, "xyz");
    expect(screen.getByText("No encontramos esa ayuda")).toBeInTheDocument();
  });

  it("filtra las preguntas por categoría", async () => {
    renderWithProviders(<CentroAyudaCiudadano />);

    await userEvent.click(screen.getByRole("button", { name: /clasificación/i }));

    expect(screen.getByText("¿Qué son las categorías?")).toBeInTheDocument();
    expect(screen.getByText("¿Quién decide la categoría y la prioridad?")).toBeInTheDocument();
    expect(screen.queryByText("¿Cómo cargo un reclamo?")).not.toBeInTheDocument();
  });
});
