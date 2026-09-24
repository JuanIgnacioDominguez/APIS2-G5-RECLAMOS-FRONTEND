import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { App } from "@/App";

describe("NotFoundPage", () => {
  it("muestra el 404 en una ruta desconocida (con sesion)", async () => {
    renderWithProviders(<App />, { route: "/ruta-que-no-existe", usuario: CIUDADANO });
    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ir al inicio/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /volver/i })).toBeInTheDocument();
  });

  it("una ruta desconocida sin sesion lleva al login", async () => {
    renderWithProviders(
      <Routes>
        <Route path="*" element={<App />} />
      </Routes>,
      { route: "/ruta-que-no-existe" },
    );
    expect(await screen.findByRole("button", { name: /^ingresar$/i })).toBeInTheDocument();
  });
});
