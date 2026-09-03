import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as authApi from "@/api/auth";
import { getAuthToken, setAuthToken } from "@/api/client";
import { renderWithProviders } from "@/test/render";
import { useAuth } from "./AuthContext";

function Harness() {
  const { usuario, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{usuario ? `${usuario.nombre} (${usuario.rol})` : "nadie"}</span>
      <button onClick={() => login("operador1", "operador1").catch(() => {})}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const tokenOut: authApi.TokenOut = {
  access_token: "jwt-real-123",
  token_type: "bearer",
  expires_in: 3600,
  usuario: {
    id: "operador-1",
    nombre: "Operador Municipal",
    email: "operador1@citypass.local",
    roles: ["operador"],
  },
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  it("empieza sin sesion", () => {
    renderWithProviders(<Harness />);
    expect(screen.getByTestId("user")).toHaveTextContent("nadie");
    expect(getAuthToken()).toBeNull();
  });

  it("login guarda el usuario y el JWT real del backend", async () => {
    vi.spyOn(authApi, "loginDev").mockResolvedValue(tokenOut);
    renderWithProviders(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "login" }));

    expect(await screen.findByText(/Operador Municipal \(operador\)/)).toBeInTheDocument();
    expect(getAuthToken()).toBe("jwt-real-123");
    expect(localStorage.getItem("citypass.auth.sesion")).toContain("jwt-real-123");
    expect(authApi.loginDev).toHaveBeenCalledWith("operador1", "operador1");
  });

  it("logout limpia sesion, token y storage", async () => {
    vi.spyOn(authApi, "loginDev").mockResolvedValue(tokenOut);
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await screen.findByText(/Operador Municipal/);
    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("user")).toHaveTextContent("nadie");
    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem("citypass.auth.sesion")).toBeNull();
  });

  it("restaura la sesion desde localStorage al montar", () => {
    localStorage.setItem(
      "citypass.auth.sesion",
      JSON.stringify({
        usuario: { id: "x", nombre: "Guardado", email: "g@x.com", rol: "ciudadano" },
        token: "jwt-guardado",
      }),
    );
    renderWithProviders(<Harness />);
    expect(screen.getByTestId("user")).toHaveTextContent("Guardado");
    expect(getAuthToken()).toBe("jwt-guardado");
  });
});
