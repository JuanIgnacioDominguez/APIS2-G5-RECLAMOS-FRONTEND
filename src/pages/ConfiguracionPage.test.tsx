import { afterEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render";
import { ayudaActiva } from "@/lib/ayudaGuiada";
import { ConfiguracionPage } from "./ConfiguracionPage";

afterEach(() => {
  localStorage.clear();
});

describe("ConfiguracionPage", () => {
  it("permite activar y desactivar la ayuda guiada", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ConfiguracionPage />);

    // Starts on by default.
    expect(ayudaActiva()).toBe(true);

    await user.click(screen.getByRole("button", { name: /^desactivada$/i }));
    expect(ayudaActiva()).toBe(false);

    await user.click(screen.getByRole("button", { name: /^activada$/i }));
    expect(ayudaActiva()).toBe(true);
  });

  it("expone las opciones de tema", () => {
    renderWithProviders(<ConfiguracionPage />);
    expect(screen.getByRole("button", { name: /claro/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /oscuro/i })).toBeInTheDocument();
  });
});
