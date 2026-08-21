import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { SectionPlaceholder } from "./SectionPlaceholder";

function renderEn(ruta: string) {
  return renderWithProviders(
    <Routes>
      <Route path="*" element={<SectionPlaceholder />} />
    </Routes>,
    { route: ruta },
  );
}

describe("SectionPlaceholder", () => {
  it("muestra el nombre de la seccion y el grupo responsable", () => {
    renderEn("/movilidad");
    expect(screen.getByRole("heading", { name: "Movilidad" })).toBeInTheDocument();
    expect(screen.getByText(/Grupo 3/)).toBeInTheDocument();
    expect(screen.getByText(/se integrara por https/i)).toBeInTheDocument();
  });

  it("siempre ofrece volver a Reclamos", () => {
    renderEn("/emergencias");
    expect(screen.getByRole("button", { name: /ir a reclamos/i })).toBeInTheDocument();
  });
});
