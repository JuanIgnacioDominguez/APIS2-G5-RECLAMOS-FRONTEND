import { afterEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rol } from "@/auth/roles";
import type { Usuario } from "@/auth/users";
import { renderWithProviders } from "@/test/render";
import { TableroAnalitica } from "./TableroAnalitica";

const admin: Usuario = { id: "u1", nombre: "Admin", email: "a@x.com", rol: Rol.ADMIN };

function html(cuerpo: string) {
  return Promise.resolve(new Response(cuerpo, { status: 200 }));
}

describe("TableroAnalitica", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("muestra el tablero en un iframe aislado, sin allow-same-origin", async () => {
    const fetchMock = vi.fn(() => html("<p>tablero</p>"));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<TableroAnalitica />, { usuario: admin });

    const iframe = await screen.findByTitle("Tablero de Analitica");
    expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    expect(iframe).toHaveAttribute("srcdoc", "<p>tablero</p>");
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: "Bearer seed" });
  });

  it("ajusta la altura cuando el tablero la avisa", async () => {
    vi.stubGlobal("fetch", () => html("<p>t</p>"));
    renderWithProviders(<TableroAnalitica />, { usuario: admin });
    const iframe = await screen.findByTitle("Tablero de Analitica");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { tipo: "citypass-tablero-altura", altura: 900 },
          origin: "null",
          source: (iframe as HTMLIFrameElement).contentWindow,
        }),
      );
    });
    await waitFor(() => expect(iframe).toHaveStyle({ height: "900px" }));
  });

  it("ignora mensajes que no vienen del iframe", async () => {
    vi.stubGlobal("fetch", () => html("<p>t</p>"));
    renderWithProviders(<TableroAnalitica />, { usuario: admin });
    const iframe = await screen.findByTitle("Tablero de Analitica");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: { tipo: "citypass-tablero-altura", altura: 50 } }),
      );
    });
    expect(iframe).toHaveStyle({ height: "1200px" });
  });

  it("ignora mensajes de otro origen aunque vengan del iframe", async () => {
    vi.stubGlobal("fetch", () => html("<p>t</p>"));
    renderWithProviders(<TableroAnalitica />, { usuario: admin });
    const iframe = await screen.findByTitle("Tablero de Analitica");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { tipo: "citypass-tablero-altura", altura: 50 },
          origin: "https://otro.example",
          source: (iframe as HTMLIFrameElement).contentWindow,
        }),
      );
    });
    expect(iframe).toHaveStyle({ height: "1200px" });
  });

  it("muestra el error y permite reintentar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockImplementation(() => html("<p>ok</p>"));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<TableroAnalitica />, { usuario: admin });

    expect(await screen.findByText("Analitica no disponible")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(await screen.findByTitle("Tablero de Analitica")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("sin sesion no llama a Analitica", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<TableroAnalitica />);
    expect(await screen.findByText(/no hay una sesion activa/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
