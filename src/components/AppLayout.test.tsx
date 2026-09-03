import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { USUARIOS_DEMO } from "@/auth/users";
import { AppLayout } from "./AppLayout";

function renderLayout(ruta = "/reclamos") {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/reclamos" element={<div>contenido de reclamos</div>} />
      </Route>
    </Routes>,
    { route: ruta, usuario: USUARIOS_DEMO[0] },
  );
}

describe("AppLayout", () => {
  it("muestra el menu del ciudadano y las otras secciones", () => {
    renderLayout();
    for (const label of ["Mis reclamos", "Nuevo reclamo", "Movilidad", "Residuos", "Emergencias"]) {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
  });

  it("marca el modulo propio como activo", () => {
    renderLayout();
    expect(screen.getAllByText("activo").length).toBeGreaterThan(0);
  });

  it("renderiza el contenido de la ruta hija y la barra de busqueda", () => {
    renderLayout();
    expect(screen.getByText("contenido de reclamos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar reclamos/i)).toBeInTheDocument();
  });

  it("muestra el usuario autenticado y su rol", () => {
    renderLayout();
    expect(screen.getByText(USUARIOS_DEMO[0].nombre)).toBeInTheDocument();
    expect(screen.getByText("Ciudadano")).toBeInTheDocument();
  });
});
