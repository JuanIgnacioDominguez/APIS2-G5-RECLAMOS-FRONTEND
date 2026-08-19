import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getAuthToken, request, setAuthToken } from "./client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("request", () => {
  beforeEach(() => {
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    setAuthToken(null);
  });

  it("hace GET y devuelve el JSON parseado", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await request<{ ok: boolean }>("/reclamos");

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/reclamos");
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("adjunta el token bearer cuando esta seteado", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    setAuthToken("tok-123");
    expect(getAuthToken()).toBe("tok-123");

    await request("/reclamos");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer tok-123");
  });

  it("serializa el body y arma la query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: "1" }));
    vi.stubGlobal("fetch", fetchMock);

    await request("/reclamos", {
      method: "POST",
      body: { titulo: "hola" },
      query: { estado: "RECIBIDO", vacio: undefined, page: 1 },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ titulo: "hola" }));
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(url).toContain("estado=RECIBIDO");
    expect(url).toContain("page=1");
    expect(url).not.toContain("vacio");
  });

  it("devuelve undefined ante un 204 sin cuerpo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(204, null)));
    await expect(request("/reclamos/1")).resolves.toBeUndefined();
  });

  it("lanza ApiError con el detalle del problem+json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(409, {
          title: "Conflicto",
          detail: "Transicion invalida",
          code: "conflict",
        }),
      ),
    );

    await expect(request("/reclamos/1/estado")).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "Transicion invalida",
      code: "conflict",
    });
  });

  it("cae al statusText si el error no es JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("boom", { status: 500, statusText: "Server Error" })),
    );

    const error = await request("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
  });
});
