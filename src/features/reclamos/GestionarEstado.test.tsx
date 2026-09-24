import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoOut } from "@/api/types";
import { EstadoReclamo } from "@/domain/enums";
import { CategoriaReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { OPERADOR } from "@/test/usuarios";
import { GestionarEstado } from "./GestionarEstado";

describe("GestionarEstado", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("en un estado final no ofrece cambios", () => {
    renderWithProviders(
      <GestionarEstado
        reclamoId="1"
        estadoActual={EstadoReclamo.CERRADO}
        onActualizado={vi.fn()}
      />,
    );
    expect(screen.getByText(/estado final/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /aplicar cambio/i })).not.toBeInTheDocument();
  });

  it("aplica una transicion valida y avisa al padre", async () => {
    const cambiar = vi.spyOn(reclamosApi, "cambiarEstado").mockResolvedValue({} as ReclamoOut);
    const onActualizado = vi.fn();
    renderWithProviders(
      <GestionarEstado
        reclamoId="r1"
        estadoActual={EstadoReclamo.ASIGNADO}
        onActualizado={onActualizado}
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: /nuevo estado/i }));
    await userEvent.click(await screen.findByRole("option", { name: "En proceso" }));
    await userEvent.click(screen.getByRole("button", { name: /aplicar cambio/i }));

    await waitFor(() => expect(onActualizado).toHaveBeenCalled());
    expect(cambiar).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ estado: EstadoReclamo.EN_PROCESO }),
    );
  });

  it("al asignar manda asignado_a y area_responsable, con Asignarme y area sugerida", async () => {
    const cambiar = vi.spyOn(reclamosApi, "cambiarEstado").mockResolvedValue({} as ReclamoOut);
    renderWithProviders(
      <GestionarEstado
        reclamoId="r2"
        estadoActual={EstadoReclamo.RECIBIDO}
        categoria={CategoriaReclamo.RESIDUOS}
        onActualizado={vi.fn()}
      />,
      { usuario: OPERADOR },
    );

    await userEvent.click(screen.getByRole("combobox", { name: /nuevo estado/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Asignado" }));

    // Area suggested from the category,.
    expect(screen.getByPlaceholderText("Higiene Urbana")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /asignarme/i }));
    await userEvent.type(screen.getByLabelText(/área responsable/i), "Higiene");
    await userEvent.click(screen.getByRole("button", { name: /aplicar cambio/i }));

    await waitFor(() => expect(cambiar).toHaveBeenCalled());
    expect(cambiar).toHaveBeenCalledWith(
      "r2",
      expect.objectContaining({
        estado: EstadoReclamo.ASIGNADO,
        asignado_a: OPERADOR.nombre,
        area_responsable: "Higiene",
      }),
    );
  });
});
