import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { SugerenciaClasificacion } from "@/api/types";
import { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ReclamoForm } from "./ReclamoForm";

const TITULO = "Luminaria apagada";
const DESCRIPCION = "Hace una semana que no funciona el alumbrado.";

describe("ReclamoForm", () => {
  // `delay: null` types the whole string in one tick instead of key-by-key,
  // which keeps these long-text tests well under the timeout on a loaded runner.
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.restoreAllMocks();
    user = userEvent.setup({ delay: null });
    // By default no suggestion, so it never interferes with the base cases.
    vi.spyOn(reclamosApi, "sugerirClasificacion").mockRejectedValue(new Error("sin backend"));
  });

  it("no envia y muestra errores cuando los campos son invalidos", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ReclamoForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /enviar reclamo/i }));

    expect(await screen.findByText(/al menos 5 caracteres/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia los datos recortados cuando el formulario es valido", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ReclamoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/titulo/i), TITULO);
    await user.type(screen.getByLabelText(/descripcion/i), DESCRIPCION);
    await user.click(screen.getByRole("button", { name: /enviar reclamo/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: TITULO, descripcion: DESCRIPCION }),
    );
  });

  it("muestra la sugerencia automatica y la aplica al formulario", async () => {
    const sugerencia: SugerenciaClasificacion = {
      categoria: CategoriaReclamo.ALUMBRADO,
      prioridad: PrioridadReclamo.ALTA,
      confianza: 0.87,
      evidencia: ["luminaria", "alumbrado"],
      modelo: "naive-bayes",
    };
    vi.spyOn(reclamosApi, "sugerirClasificacion").mockResolvedValue(sugerencia);

    renderWithProviders(<ReclamoForm onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText(/titulo/i), TITULO);
    await user.type(screen.getByLabelText(/descripcion/i), DESCRIPCION);

    // La sugerencia aparece tras el debounce.
    expect(
      await screen.findByText(/sugerencia automatica/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/de confianza/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^aplicar$/i }));

    // La categoria del select queda seteada al valor sugerido.
    expect(screen.getByRole("combobox", { name: /categoria/i })).toHaveTextContent("Alumbrado");
  });
});
