import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoOut } from "@/api/types";
import { CategoriaReclamo, ObjetoAfectado, PrioridadReclamo } from "@/domain/enums";
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
    expect(screen.getByRole("button", { name: /guardar clasificación/i })).toBeDisabled();
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

    await userEvent.click(screen.getByRole("combobox", { name: /categoría/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Alumbrado" }));
    await userEvent.click(screen.getByRole("button", { name: /guardar clasificación/i }));

    await waitFor(() => expect(onActualizado).toHaveBeenCalled());
    expect(reclas).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ categoria: CategoriaReclamo.ALUMBRADO }),
    );
  });

  it("guarda el objeto afectado nuevo y no manda el campo cuando no se toco", async () => {
    const reclas = vi.spyOn(reclamosApi, "reclasificar").mockResolvedValue({} as ReclamoOut);
    renderWithProviders(
      <ClasificarReclamo
        reclamoId="r2"
        categoriaActual={CategoriaReclamo.BACHES}
        prioridadActual={PrioridadReclamo.ALTA}
        objetoActual={null}
        onActualizado={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: /objeto afectado/i }));
    await userEvent.click(await screen.findByRole("option", { name: /ciclovía/i }));
    await userEvent.click(screen.getByRole("button", { name: /guardar clasificación/i }));

    await waitFor(() => expect(reclas).toHaveBeenCalled());
    expect(reclas).toHaveBeenCalledWith(
      "r2",
      expect.objectContaining({ objeto_afectado: ObjetoAfectado.CICLOVIA }),
    );
  });

  it("no incluye objeto_afectado si el operador solo cambia la categoria", async () => {
    const reclas = vi.spyOn(reclamosApi, "reclasificar").mockResolvedValue({} as ReclamoOut);
    renderWithProviders(
      <ClasificarReclamo
        reclamoId="r3"
        categoriaActual={CategoriaReclamo.BACHES}
        prioridadActual={PrioridadReclamo.ALTA}
        objetoActual={ObjetoAfectado.CICLOVIA}
        onActualizado={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: /categoría/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Alumbrado" }));
    await userEvent.click(screen.getByRole("button", { name: /guardar clasificación/i }));

    await waitFor(() => expect(reclas).toHaveBeenCalled());
    const cambio = reclas.mock.calls[0]![1];
    expect(cambio).not.toHaveProperty("objeto_afectado");
  });
});
