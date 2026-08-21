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
    </Routes>,
    { route: "/login" },
  );
}

describe("LoginPage", () => {
  it("muestra los campos de acceso", () => {
    renderLogin();
    expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
  });

  it("entra a la app al ingresar", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));
    expect(screen.getByText("listado de reclamos")).toBeInTheDocument();
  });

  it("tambien entra por acceso institucional (LDAP)", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /acceso institucional/i }));
    expect(screen.getByText("listado de reclamos")).toBeInTheDocument();
  });
});
