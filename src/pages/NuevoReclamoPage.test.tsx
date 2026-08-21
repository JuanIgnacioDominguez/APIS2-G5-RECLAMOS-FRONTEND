import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import * as reclamosApi from "@/api/reclamos";
import type { ReclamoOut } from "@/api/types";
import { renderWithProviders } from "@/test/render";
import { NuevoReclamoPage } from "./NuevoReclamoPage";

function renderNuevo() {
  return renderWithProviders(
    <Routes>
      <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
      <Route path="/reclamos/:id" element={<div>detalle del reclamo</div>} />
    </Routes>,
    { route: "/reclamos/nuevo" },
  );
}

describe("NuevoReclamoPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("crea el reclamo y navega al detalle", async () => {
    vi.spyOn(reclamosApi, "crearReclamo").mockResolvedValue({ id: "nuevo-1" } as ReclamoOut);
    renderNuevo();

    await userEvent.type(screen.getByLabelText(/titulo/i), "Bache profundo");
    await userEvent.type(
      screen.getByLabelText(/descripcion/i),
      "Hay un bache peligroso hace varios dias.",
    );
    await userEvent.click(screen.getByRole("button", { name: /enviar reclamo/i }));

    await waitFor(() => expect(screen.getByText("detalle del reclamo")).toBeInTheDocument());
    expect(reclamosApi.crearReclamo).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: "Bache profundo" }),
    );
  });

  it("muestra un error cuando la creacion falla", async () => {
    vi.spyOn(reclamosApi, "crearReclamo").mockRejectedValue(new Error("422 invalido"));
    renderNuevo();

    await userEvent.type(screen.getByLabelText(/titulo/i), "Bache profundo");
    await userEvent.type(
      screen.getByLabelText(/descripcion/i),
      "Hay un bache peligroso hace varios dias.",
    );
    await userEvent.click(screen.getByRole("button", { name: /enviar reclamo/i }));

    await waitFor(() => expect(reclamosApi.crearReclamo).toHaveBeenCalled());
    expect(screen.queryByText("detalle del reclamo")).not.toBeInTheDocument();
  });
});
