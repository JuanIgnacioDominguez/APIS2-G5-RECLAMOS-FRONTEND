import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoOut } from "@/api/types";
import { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { ClasificarReclamo } from "./ClasificarReclamo";

describe("ClasificarReclamo", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("el boton esta deshabilitado si no hay cambios", () => {
    renderWithProviders(
      <ClasificarReclamo
        reclamoId="1"
        categoriaActual={CategoriaReclamo.BACHES}
        prioridadActual={PrioridadReclamo.ALTA}
        onActualizado={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /guardar clasificacion/i })).toBeDisabled();
  });

  it("guarda la nueva categoria y avisa al padre", async () => {
    const reclas = vi.spyOn(reclamosApi, "reclasificar").mockResolvedValue({} as ReclamoOut);
    const onActualizado = vi.fn();
    renderWithProviders(
      <ClasificarReclamo
        reclamoId="r1"
        categoriaActual={CategoriaReclamo.BACHES}
        prioridadActual={PrioridadReclamo.ALTA}
        onActualizado={onActualizado}
      />,
    );

    await userEvent.click(screen.getByRole("textbox", { name: /categoria/i }));
    await userEvent.click(await screen.findByText("Alumbrado"));
    await userEvent.click(screen.getByRole("button", { name: /guardar clasificacion/i }));

    await waitFor(() => expect(onActualizado).toHaveBeenCalled());
    expect(reclas).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ categoria: CategoriaReclamo.ALUMBRADO }),
    );
  });
});
