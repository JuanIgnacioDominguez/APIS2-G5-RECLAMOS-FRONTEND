import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/api/client";
import { obtenerTableroAnalitica } from "./analitica";

describe("obtenerTableroAnalitica", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("pide el tablero de reclamos con el token solo en la cabecera y sin cache", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response("<html>ok</html>", { status: 200 })),
    );
    vi.stubGlobal("fetch", fetchMock);

    const html = await obtenerTableroAnalitica("tok-123");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(html).toBe("<html>ok</html>");
    expect(url.endsWith("/embed/reclamos")).toBe(true);
    expect(url).not.toContain("tok-123");
    expect(init.cache).toBe("no-store");
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok-123" });
  });

  it.each([
    [401, /sesion/i],
    [403, /acceso/i],
    [503, /no esta disponible/i],
  ])("traduce el %i a un mensaje entendible", async (status, mensaje) => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("", { status })));
    await expect(obtenerTableroAnalitica("t")).rejects.toMatchObject({
      status,
      message: expect.stringMatching(mensaje),
    });
  });

  it("si no hay red (o CORS) devuelve un error de red", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("Failed to fetch")));
    const error = await obtenerTableroAnalitica("t").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("red");
  });
});
