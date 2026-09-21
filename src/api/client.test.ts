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
