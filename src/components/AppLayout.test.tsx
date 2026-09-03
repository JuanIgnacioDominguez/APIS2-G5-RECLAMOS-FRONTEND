import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { AppLayout } from "./AppLayout";

function renderLayout(ruta = "/reclamos") {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/reclamos" element={<div>contenido de reclamos</div>} />
      </Route>
    </Routes>,
    { route: ruta, usuario: CIUDADANO },
  );
}

describe("AppLayout", () => {
  it("muestra el menu del ciudadano (solo reclamos)", () => {
    renderLayout();
    expect(screen.getByRole("link", { name: /mis reclamos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /nuevo reclamo/i })).toBeInTheDocument();
    // Otros modulos no pertenecen a este sistema.
    expect(screen.queryByRole("link", { name: /movilidad/i })).not.toBeInTheDocument();
  });

  it("renderiza el contenido de la ruta hija y la barra de busqueda", () => {
    renderLayout();
    expect(screen.getByText("contenido de reclamos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar reclamos/i)).toBeInTheDocument();
  });

  it("muestra el usuario autenticado y su rol", () => {
    renderLayout();
    expect(screen.getByText(CIUDADANO.nombre)).toBeInTheDocument();
    expect(screen.getByText("Ciudadano")).toBeInTheDocument();
  });
});
