import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { AyudaPage } from "./AyudaPage";
import { ConfiguracionPage } from "./ConfiguracionPage";
import { CuentaPage } from "./CuentaPage";
import { NotificacionesPage } from "./NotificacionesPage";

describe("paginas personales del sidebar", () => {
  it("Mi cuenta muestra nombre, correo y rol", () => {
    renderWithProviders(<CuentaPage />, { usuario: CIUDADANO });
    expect(screen.getAllByText(CIUDADANO.nombre).length).toBeGreaterThan(0);
    expect(screen.getByText(CIUDADANO.email)).toBeInTheDocument();
    expect(screen.getAllByText("Ciudadano").length).toBeGreaterThan(0);
  });

  it("Notificaciones muestra el estado vacio", () => {
    renderWithProviders(<NotificacionesPage />);
    expect(screen.getByText("Sin novedades")).toBeInTheDocument();
  });

  it("Configuracion cambia el tema y lo persiste", async () => {
    renderWithProviders(<ConfiguracionPage />);
    await userEvent.click(screen.getByRole("button", { name: /oscuro/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: /claro/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("Ayuda explica todos los estados y prioridades", () => {
    renderWithProviders(<AyudaPage />);
    expect(screen.getByText("Recibido")).toBeInTheDocument();
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
    expect(screen.getByText("Critica")).toBeInTheDocument();
  });
});
