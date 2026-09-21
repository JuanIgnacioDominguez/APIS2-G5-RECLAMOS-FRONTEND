import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoOut } from "@/api/types";
import { EstadoReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
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

    await userEvent.click(screen.getByRole("textbox", { name: /nuevo estado/i }));
    await userEvent.click(await screen.findByText("En proceso"));
    await userEvent.click(screen.getByRole("button", { name: /aplicar cambio/i }));

    await waitFor(() => expect(onActualizado).toHaveBeenCalled());
    expect(cambiar).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ estado: EstadoReclamo.EN_PROCESO }),
    );
  });
});
