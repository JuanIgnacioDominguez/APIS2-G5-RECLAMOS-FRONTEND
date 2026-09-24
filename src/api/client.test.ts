import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, request, setAuthToken, setUnauthorizedHandler } from "./client";

function mockFetch(status: number, body: unknown = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: "",
      json: async () => body,
    } as Response),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  setAuthToken(null);
  setUnauthorizedHandler(null);
});

describe("request - manejo de 401", () => {
  it("con sesion activa, un 401 dispara el handler de no-autorizado", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setAuthToken("token-vencido");
    mockFetch(401, { detail: "Token invalido: Signature has expired" });

    await expect(request("/reclamos")).rejects.toThrow(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("sin sesion (login), un 401 NO dispara el handler", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setAuthToken(null);
    mockFetch(401, { detail: "Credenciales invalidas" });

    await expect(request("/auth/dev/login", { method: "POST", body: {} })).rejects.toThrow(
      ApiError,
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("propaga el mensaje del backend en el ApiError", async () => {
    setAuthToken("t");
    mockFetch(401, { detail: "Token invalido: Signature has expired" });

    await expect(request("/reclamos")).rejects.toMatchObject({
      status: 401,
      message: "Token invalido: Signature has expired",
    });
  });
});

describe("request - mensajes y errores de red", () => {
  it("reemplaza el texto crudo por un mensaje claro segun el code", async () => {
    setAuthToken("t");
    mockFetch(409, { detail: "Adhesion rechazada: autor", code: "adhesion_del_autor" });

    await expect(request("/reclamos/1/adhesiones", { method: "POST" })).rejects.toMatchObject({
      status: 409,
      code: "adhesion_del_autor",
      message: expect.stringMatching(/no podes sumarte a tu propio reclamo/i),
    });
  });

  it("un fallo de fetch (offline) se convierte en un ApiError de red", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(request("/reclamos")).rejects.toMatchObject({
      status: 0,
      code: "red",
      message: expect.stringMatching(/no pudimos conectar/i),
    });
  });

  it("no confunde un abort con un error de red", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")));

    await expect(request("/reclamos")).rejects.toBeInstanceOf(DOMException);
  });
});
