import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/api/client";
import { RUTA_ANALITICA, iniciarSesionAnalitica, revocarSesionAnalitica } from "./analitica";

const sesion = {
  usuario_id: "u1",
  expires_at: "2030-01-01T00:00:00Z",
  estado: "activa",
  iframe_url: RUTA_ANALITICA,
  csrf_token: "csrf-1",
};

describe("iniciarSesionAnalitica", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("abre la sesion con el token solo en la cabecera, ruta relativa y sin cache", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json(sesion)));
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await iniciarSesionAnalitica("tok-123");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(resultado.csrf_token).toBe("csrf-1");
    expect(url).toBe(`${RUTA_ANALITICA}/sesion`);
    expect(url).not.toContain("tok-123");
    expect(init.method).toBe("POST");
    expect(init.body).toBe("{}");
    expect(init.cache).toBe("no-store");
    expect(init.credentials).toBe("same-origin");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer tok-123",
      "Content-Type": "application/json",
    });
  });

  it.each([
    [401, /sesion/i],
    [403, /acceso/i],
    [404, /habilitado/i],
    [409, /otro usuario/i],
    [503, /no esta disponible/i],
    [418, /no se pudo abrir/i],
  ])("traduce el %i a un mensaje entendible", async (status, mensaje) => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("", { status })));
    await expect(iniciarSesionAnalitica("t")).rejects.toMatchObject({
      status,
      message: expect.stringMatching(mensaje),
    });
  });

  it("si no hay red devuelve un error de red", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("Failed to fetch")));
    const error = await iniciarSesionAnalitica("t").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("red");
  });

  it("deja pasar el abort sin convertirlo en error de red", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new DOMException("x", "AbortError")));
    await expect(iniciarSesionAnalitica("t")).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("revocarSesionAnalitica", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("revoca con el CSRF en la cabecera", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json({ revocada: true })));
    vi.stubGlobal("fetch", fetchMock);
    await revocarSesionAnalitica("csrf-1");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${RUTA_ANALITICA}/sesion`);
    expect(init.method).toBe("DELETE");
    expect(init.headers).toMatchObject({ "X-CSRF-Token": "csrf-1" });
  });

  it("falla si el backend rechaza el cierre", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("", { status: 403 })));
    await expect(revocarSesionAnalitica("x")).rejects.toMatchObject({ status: 403 });
  });
});
