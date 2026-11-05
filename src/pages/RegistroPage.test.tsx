import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as authApi from "@/api/auth";
import { ApiError } from "@/api/client";
import { renderWithProviders } from "@/test/render";
import { RegistroPage } from "./RegistroPage";

function tokenCiudadano(): authApi.TokenOut {
  return {
    access_token: "jwt-vecino",
    token_type: "bearer",
    expires_in: 43200,
    usuario: { id: "uuid-1", nombre: "Vecina", email: "vecina@ejemplo.com", roles: ["ciudadano"] },
  };
}

function renderRegistro() {
  return renderWithProviders(
    <Routes>
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/login" element={<div>ingreso de vecinos</div>} />
      <Route path="/reclamos" element={<div>listado de reclamos</div>} />
    </Routes>,
    { route: "/registro" },
  );
}

async function completar(
  user: ReturnType<typeof userEvent.setup>,
  { nombre = "Vecina de Palermo", email = "vecina@ejemplo.com", password = "una-clave-larga" } = {},
) {
  await user.type(screen.getByLabelText(/nombre/i), nombre);
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/contrasena/i), password);
}

describe("RegistroPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("no llama a la API si la contrasena es demasiado corta", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authApi, "registrarCiudadano");
    renderRegistro();

    await completar(user, { password: "corta" });
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/entre 10 y 128 caracteres/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it("registra al vecino y entra directo, sin pedir login", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authApi, "registrarCiudadano").mockResolvedValue(tokenCiudadano());
    renderRegistro();

    await completar(user);
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("listado de reclamos")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith({
      nombre: "Vecina de Palermo",
      email: "vecina@ejemplo.com",
      password: "una-clave-larga",
    });
  });

  it("ante un email ya registrado lo avisa y ofrece iniciar sesion", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "registrarCiudadano").mockRejectedValue(
      new ApiError(409, "Ese email ya tiene una cuenta.", "email_ya_registrado"),
    );
    renderRegistro();

    await completar(user);
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/ya tiene una cuenta/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inicia sesion/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByText("listado de reclamos")).not.toBeInTheDocument();
  });
});
