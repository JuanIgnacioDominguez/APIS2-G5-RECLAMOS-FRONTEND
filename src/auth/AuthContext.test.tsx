import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as authApi from "@/api/auth";
import { getAuthToken, request, setAuthToken } from "@/api/client";
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

  it("el primer pedido de un hijo tras recargar ya lleva el token", async () => {
    // Reproduces the F5 bug: a child fires its request in its own effect, which
    // runs before the provider's effect. The token must already be seeded.
    localStorage.setItem(
      "citypass.auth.sesion",
      JSON.stringify({
        usuario: { id: "x", nombre: "Guardado", email: "g@x.com", rol: "ciudadano" },
        token: "jwt-guardado",
      }),
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    function Hijo() {
      useEffect(() => {
        void request("/reclamos").catch(() => {});
      }, []);
      return null;
    }

    renderWithProviders(<Hijo />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer jwt-guardado");
    vi.unstubAllGlobals();
  });
});
