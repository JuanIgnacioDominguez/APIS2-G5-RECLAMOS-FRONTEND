import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as authApi from "@/api/auth";
import { ApiError } from "@/api/client";
import { renderWithProviders } from "@/test/render";
import { LoginPage } from "./LoginPage";

function tokenPara(id: string, roles: string[]): authApi.TokenOut {
  return {
    access_token: "jwt-x",
    token_type: "bearer",
    expires_in: 3600,
    usuario: { id, nombre: "Test", email: `${id}@citypass.local`, roles },
  };
}

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
  beforeEach(() => vi.restoreAllMocks());

  it("muestra el formulario, Google y los accesos rapidos por rol", () => {
    renderLogin();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Operador" })).toBeInTheDocument();
  });

  it("ingresa con credenciales validas y aterriza segun el rol", async () => {
    vi.spyOn(authApi, "loginDev").mockResolvedValue(tokenPara("vecino-1", ["ciudadano"]));
    renderLogin();

    await userEvent.type(screen.getByLabelText(/usuario/i), "vecino1");
    await userEvent.type(screen.getByLabelText(/contrasena/i), "vecino1");
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));

    expect(await screen.findByText("listado de reclamos")).toBeInTheDocument();
    expect(authApi.loginDev).toHaveBeenCalledWith("vecino1", "vecino1");
  });

  it("muestra un error cuando el backend rechaza las credenciales", async () => {
    vi.spyOn(authApi, "loginDev").mockRejectedValue(
      new ApiError(401, "Usuario o contrasena incorrectos"),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/usuario/i), "vecino1");
    await userEvent.type(screen.getByLabelText(/contrasena/i), "mala");
    await userEvent.click(screen.getByRole("button", { name: /^ingresar$/i }));

    expect(await screen.findByText(/incorrectos/i)).toBeInTheDocument();
    expect(screen.queryByText("listado de reclamos")).not.toBeInTheDocument();
  });

  it("entra por acceso rapido como operador y aterriza en el backoffice", async () => {
    vi.spyOn(authApi, "loginDev").mockResolvedValue(tokenPara("operador-1", ["operador"]));
    renderLogin();

    await userEvent.click(screen.getByRole("button", { name: "Operador" }));

    expect(await screen.findByText("bandeja de backoffice")).toBeInTheDocument();
    expect(authApi.loginDev).toHaveBeenCalledWith("operador1", "operador1");
  });
});
