import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render";
import { EstadoError } from "./EstadoError";

describe("EstadoError", () => {
  it("muestra el mensaje y llama a reintentar", async () => {
    const onReintentar = vi.fn();
    renderWithProviders(<EstadoError mensaje="500 interno" onReintentar={onReintentar} />);

    expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument();
    expect(screen.getByText("500 interno")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it("sin onReintentar no muestra el boton", () => {
    renderWithProviders(<EstadoError />);
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });
});
