import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { Rol } from "@/auth/roles";
import { renderWithProviders } from "@/test/render";
import { AnaliticaPage } from "./AnaliticaPage";

describe("AnaliticaPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("muestra el titulo y el tablero", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("<p>t</p>", { status: 200 })));
    renderWithProviders(<AnaliticaPage />, {
      usuario: { id: "u1", nombre: "Admin", email: "a@x.com", rol: Rol.ADMIN },
    });
    expect(screen.getByRole("heading", { name: "Analitica" })).toBeInTheDocument();
    expect(await screen.findByTitle("Tablero de Analitica")).toBeInTheDocument();
  });
});
