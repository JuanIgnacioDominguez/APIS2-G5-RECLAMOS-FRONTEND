import { afterEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { establecerAyudaActiva, notificarCambioAyuda } from "@/lib/ayudaGuiada";
import { AyudaFlotante } from "./AyudaFlotante";

const drive = vi.fn();
const destroy = vi.fn();
const driverFactory = vi.fn((_config?: unknown) => ({
  drive,
  destroy,
  isActive: () => false,
  refresh: () => {},
  setConfig: () => {},
  setSteps: () => {},
  getConfig: () => ({}),
  getState: () => undefined,
  getActiveIndex: () => 0,
  isFirstStep: () => true,
  isLastStep: () => false,
  getActiveStep: () => undefined,
  getActiveElement: () => undefined,
  getPreviousElement: () => undefined,
  getPreviousStep: () => undefined,
  getNextStep: () => undefined,
  moveNext: () => {},
  movePrevious: () => {},
  moveTo: () => {},
  hasNextStep: () => false,
  hasPreviousStep: () => false,
  highlight: () => {},
}));

vi.mock("driver.js", () => ({
  driver: (config: unknown) => driverFactory(config),
}));

// The CSS import in the module has no effect in jsdom; stub it to avoid it
// being parsed by Vite's CSS loader in the test environment.
vi.mock("driver.js/dist/driver.css", () => ({}));

afterEach(() => {
  localStorage.clear();
  drive.mockClear();
  destroy.mockClear();
  driverFactory.mockClear();
});

describe("AyudaFlotante", () => {
  it("muestra el boton flotante cuando la ayuda esta activa y hay pasos", () => {
    renderWithProviders(<AyudaFlotante />, { route: "/reclamos", usuario: CIUDADANO });
    expect(
      screen.getByRole("button", { name: /recorrido guiado de esta pantalla/i }),
    ).toBeInTheDocument();
  });

  it("no se muestra cuando la ayuda esta desactivada", () => {
    establecerAyudaActiva(false);
    renderWithProviders(<AyudaFlotante />, { route: "/reclamos", usuario: CIUDADANO });
    expect(screen.queryByRole("button", { name: /recorrido guiado/i })).not.toBeInTheDocument();
  });

  it("no se muestra en rutas sin tour definido", () => {
    renderWithProviders(<AyudaFlotante />, { route: "/inexistente", usuario: CIUDADANO });
    expect(screen.queryByRole("button", { name: /recorrido guiado/i })).not.toBeInTheDocument();
  });

  it("reacciona a la desactivacion desde configuracion sin recargar", async () => {
    renderWithProviders(<AyudaFlotante />, { route: "/reclamos", usuario: CIUDADANO });
    expect(screen.getByRole("button", { name: /recorrido guiado/i })).toBeInTheDocument();

    act(() => {
      establecerAyudaActiva(false);
      notificarCambioAyuda();
    });

    expect(screen.queryByRole("button", { name: /recorrido guiado/i })).not.toBeInTheDocument();
  });

  it("al hacer clic instancia driver.js y lo dispara", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<AyudaFlotante />, { route: "/reclamos", usuario: CIUDADANO });

    await user.click(screen.getByRole("button", { name: /recorrido guiado/i }));

    expect(driverFactory).toHaveBeenCalledTimes(1);
    expect(drive).toHaveBeenCalledTimes(1);
  });
});
