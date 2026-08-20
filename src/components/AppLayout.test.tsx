import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { AppLayout } from "./AppLayout";

function renderLayout(ruta = "/reclamos") {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/reclamos" element={<div>contenido de reclamos</div>} />
      </Route>
    </Routes>,
    { route: ruta },
  );
}

describe("AppLayout", () => {
  it("muestra todas las secciones de CityPass+ en el sidebar", () => {
    renderLayout();
    for (const label of [
      "Inicio",
      "Movilidad",
      "Residuos",
      "Reclamos",
      "Emergencias",
      "Analitica Urbana",
    ]) {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
  });

  it("marca Reclamos como el modulo activo", () => {
    renderLayout();
    expect(screen.getByText("activo")).toBeInTheDocument();
  });

  it("renderiza el contenido de la ruta hija y la barra de busqueda", () => {
    renderLayout();
    expect(screen.getByText("contenido de reclamos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar reclamos/i)).toBeInTheDocument();
  });
});
