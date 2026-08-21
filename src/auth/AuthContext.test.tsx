import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getAuthToken, setAuthToken } from "@/api/client";
import { renderWithProviders } from "@/test/render";
import { useAuth } from "./AuthContext";

function Harness() {
  const { usuario, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{usuario?.nombre ?? "nadie"}</span>
      <button onClick={() => login("operador@ciudad.gob.ar")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    setAuthToken(null);
  });

  it("empieza sin sesion", () => {
    renderWithProviders(<Harness />);
    expect(screen.getByTestId("user")).toHaveTextContent("nadie");
    expect(getAuthToken()).toBeNull();
  });

  it("login setea el usuario y el token bearer", async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "login" }));

    expect(screen.getByTestId("user")).toHaveTextContent("Ana Operadora");
    expect(getAuthToken()).toMatch(/^dev\./);
    expect(localStorage.getItem("citypass.auth.usuario")).toContain("operador");
  });

  it("logout limpia la sesion, el token y el storage", async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("user")).toHaveTextContent("nadie");
    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem("citypass.auth.usuario")).toBeNull();
  });

  it("restaura la sesion desde localStorage al montar", () => {
    localStorage.setItem(
      "citypass.auth.usuario",
      JSON.stringify({ id: "x", nombre: "Guardado", email: "g@x.com", rol: "ciudadano" }),
    );
    renderWithProviders(<Harness />);
    expect(screen.getByTestId("user")).toHaveTextContent("Guardado");
    expect(getAuthToken()).toMatch(/^dev\./);
  });
});
