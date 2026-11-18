import { afterEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RUTA_ANALITICA } from "@/api/analitica";
import { Rol } from "@/auth/roles";
import type { Usuario } from "@/auth/users";
import { renderWithProviders } from "@/test/render";
import { TableroAnalitica } from "./TableroAnalitica";

const admin: Usuario = { id: "u1", nombre: "Admin", email: "a@x.com", rol: Rol.ADMIN };

function sesion(sobrescribir: Record<string, unknown> = {}) {
  return Promise.resolve(
    Response.json({
      usuario_id: "u1",
      expires_at: new Date(Date.now() + 300_000).toISOString(),
      estado: "activa",
      iframe_url: RUTA_ANALITICA,
      csrf_token: "csrf-1",
      ...sobrescribir,
    }),
  );
}

describe("TableroAnalitica", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("abre la sesion y muestra el iframe aislado con la ruta relativa", async () => {
    const fetchMock = vi.fn(() => sesion());
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<TableroAnalitica />, { usuario: admin });

    const iframe = await screen.findByTitle("Tablero de Analitica");
    expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    expect(iframe).toHaveAttribute("src", RUTA_ANALITICA);
    expect(iframe).not.toHaveAttribute("srcdoc");
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: "Bearer seed" });
  });

  it("no muestra el iframe si la sesion es de otro usuario", async () => {
    vi.stubGlobal("fetch", () => sesion({ usuario_id: "otro" }));
    renderWithProviders(<TableroAnalitica />, { usuario: admin });
    expect(await screen.findByText(/no corresponde a tu usuario/i)).toBeInTheDocument();
    expect(screen.queryByTitle("Tablero de Analitica")).not.toBeInTheDocument();
  });

  it("quita el iframe al vencer la sesion y permite abrirla de nuevo", async () => {
    vi.stubGlobal("fetch", () => sesion({ expires_at: new Date(Date.now() + 50).toISOString() }));
    renderWithProviders(<TableroAnalitica />, { usuario: admin });
    expect(await screen.findByText("La sesion del tablero vencio")).toBeInTheDocument();
    expect(screen.queryByTitle("Tablero de Analitica")).not.toBeInTheDocument();
  });

  it("revoca la sesion al desmontar", async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      init?.method === "DELETE" ? Promise.resolve(Response.json({ revocada: true })) : sesion(),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = renderWithProviders(<TableroAnalitica />, { usuario: admin });
    await screen.findByTitle("Tablero de Analitica");

    unmount();
    const borrado = fetchMock.mock.calls.find(([, init]) => init?.method === "DELETE");
    expect(borrado?.[1]?.headers).toMatchObject({ "X-CSRF-Token": "csrf-1" });
  });

  it("ajusta la altura cuando el tablero la avisa", async () => {
    vi.stubGlobal("fetch", () => sesion());
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

  it("ignora mensajes que no vienen del iframe o de otro origen", async () => {
    vi.stubGlobal("fetch", () => sesion());
    renderWithProviders(<TableroAnalitica />, { usuario: admin });
    const iframe = await screen.findByTitle("Tablero de Analitica");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: { tipo: "citypass-tablero-altura", altura: 50 } }),
      );
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
      .mockImplementation(() => sesion());
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
