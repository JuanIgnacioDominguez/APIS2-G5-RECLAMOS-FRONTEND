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
  it("muestra el formulario, Google y los accesos rapidos por rol", () => {
    renderLogin();
    expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Operador" })).toBeInTheDocument();
  });

  it("no ingresa con un email invalido y muestra el error", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo electronico/i), "no-es-email");
    await userEvent.type(screen.getByLabelText(/contrasena/i), "1234");
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));

    expect(await screen.findByText(/email valido/i)).toBeInTheDocument();
    expect(screen.queryByText("listado de reclamos")).not.toBeInTheDocument();
  });

  it("ingresa con credenciales validas segun el rol del email", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo electronico/i), "vecino@ciudad.gob.ar");
    await userEvent.type(screen.getByLabelText(/contrasena/i), "secreta");
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));

    expect(await screen.findByText("listado de reclamos")).toBeInTheDocument();
  });

  it("entra por Google (demo) como ciudadano", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /continuar con google/i }));
    expect(screen.getByText("listado de reclamos")).toBeInTheDocument();
  });

  it("entra por acceso rapido como operador y aterriza en el backoffice", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: "Operador" }));
    expect(screen.getByText("bandeja de backoffice")).toBeInTheDocument();
  });
});
