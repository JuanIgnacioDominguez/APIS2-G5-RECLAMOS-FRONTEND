import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { ComentarioOut } from "@/api/types";
import { renderWithProviders } from "@/test/render";
import { ComentariosReclamo } from "./ComentariosReclamo";

function comentario(id: string, texto: string, oficial: boolean): ComentarioOut {
  return {
    id,
    reclamo_id: "r1",
    autor_id: "u1",
    autor_nombre: oficial ? "Operador Municipal" : "Vecina Perez",
    texto,
    es_oficial: oficial,
    created_at: new Date().toISOString(),
  };
}

describe("ComentariosReclamo", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("lista los comentarios y marca los oficiales", () => {
    renderWithProviders(
      <ComentariosReclamo
        reclamoId="r1"
        comentarios={[
          comentario("1", "Recibido, lo derivamos.", true),
          comentario("2", "Gracias!", false),
        ]}
        onComentado={vi.fn()}
      />,
    );
    expect(screen.getByText("Recibido, lo derivamos.")).toBeInTheDocument();
    expect(screen.getByText("Oficial")).toBeInTheDocument();
    expect(screen.getByText("Gracias!")).toBeInTheDocument();
  });

  it("muestra el estado vacio sin comentarios", () => {
    renderWithProviders(
      <ComentariosReclamo reclamoId="r1" comentarios={[]} onComentado={vi.fn()} />,
    );
    expect(screen.getByText(/todavia no hay comentarios/i)).toBeInTheDocument();
  });

  it("envia un comentario y avisa al padre", async () => {
    const comentar = vi
      .spyOn(reclamosApi, "comentar")
      .mockResolvedValue(comentario("3", "Nuevo", false));
    const onComentado = vi.fn();
    renderWithProviders(
      <ComentariosReclamo reclamoId="r1" comentarios={[]} onComentado={onComentado} />,
    );

    await userEvent.type(screen.getByLabelText(/nuevo comentario/i), "Sigue sin resolverse");
    await userEvent.click(screen.getByRole("button", { name: /comentar/i }));

    await waitFor(() => expect(onComentado).toHaveBeenCalled());
    expect(comentar).toHaveBeenCalledWith("r1", "Sigue sin resolverse");
  });
});
