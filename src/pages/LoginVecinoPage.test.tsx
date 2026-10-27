import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as authApi from "@/api/auth";
import { ApiError } from "@/api/client";
import { renderWithProviders } from "@/test/render";
import { LoginVecinoPage } from "./LoginVecinoPage";

function tokenCiudadano(): authApi.TokenOut {
  return {
    access_token: "jwt-vecino",
    token_type: "bearer",
    expires_in: 43200,
    usuario: { id: "uuid-1", nombre: "Vecina", email: "vecina@ejemplo.com", roles: ["ciudadano"] },
  };
}

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginVecinoPage />} />
      <Route path="/registro" element={<div>pantalla de registro</div>} />
      <Route path="/reclamos" element={<div>listado de reclamos</div>} />
    </Routes>,
    { route: "/login" },
  );
}

describe("LoginVecinoPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muestra el formulario de vecinos y el acceso a registro", () => {
    renderLogin();
    expect(screen.getByText(/ingreso vecinos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear una/i })).toHaveAttribute("href", "/registro");
    expect(
      screen.getByRole("link", { name: /personal municipal|ingresa por aca/i }),
    ).toHaveAttribute("href", "/empleados");
  });

  it("ingresa con credenciales validas y aterriza en reclamos", async () => {
    const spy = vi.spyOn(authApi, "loginCiudadano").mockResolvedValue(tokenCiudadano());
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "vecina@ejemplo.com");
    await userEvent.type(screen.getByLabelText(/contrasena/i), "una-clave-larga");
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));

    expect(await screen.findByText("listado de reclamos")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith("vecina@ejemplo.com", "una-clave-larga");
  });

  it("ante un error de credenciales muestra un unico mensaje generico", async () => {
    vi.spyOn(authApi, "loginCiudadano").mockRejectedValue(
      new ApiError(401, "Email o contrasena incorrectos.", "credenciales_invalidas"),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "vecina@ejemplo.com");
    await userEvent.type(screen.getByLabelText(/contrasena/i), "mala");
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));

    expect(await screen.findByText(/email o contrasena incorrectos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("listado de reclamos")).not.toBeInTheDocument();
  });
});
