import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { LoginPage } from "./LoginPage";

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reclamos" element={<div>listado de reclamos</div>} />
      <Route path="/backoffice" element={<div>bandeja de backoffice</div>} />
    </Routes>,
    { route: "/login" },
  );
}

describe("LoginPage", () => {
  it("muestra los campos de acceso y los accesos rapidos por rol", () => {
    renderLogin();
    expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ciudadano" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Operador" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Administrador" })).toBeInTheDocument();
  });

  it("entra con el boton Ingresar", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));
    expect(screen.getByText("listado de reclamos")).toBeInTheDocument();
  });

  it("entra por acceso rapido como operador y aterriza en el backoffice", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: "Operador" }));
    expect(screen.getByText("bandeja de backoffice")).toBeInTheDocument();
  });
});
