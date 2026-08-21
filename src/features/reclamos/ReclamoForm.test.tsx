import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render";
import { ReclamoForm } from "./ReclamoForm";

describe("ReclamoForm", () => {
  it("no envia y muestra errores cuando los campos son invalidos", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ReclamoForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /enviar reclamo/i }));

    expect(await screen.findByText(/al menos 5 caracteres/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia los datos recortados cuando el formulario es valido", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ReclamoForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/titulo/i), "Luminaria apagada");
    await userEvent.type(
      screen.getByLabelText(/descripcion/i),
      "Hace una semana que no funciona el alumbrado.",
    );
    await userEvent.click(screen.getByRole("button", { name: /enviar reclamo/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Luminaria apagada",
        descripcion: "Hace una semana que no funciona el alumbrado.",
        categoria: null,
        prioridad: null,
      }),
    );
  });
});
