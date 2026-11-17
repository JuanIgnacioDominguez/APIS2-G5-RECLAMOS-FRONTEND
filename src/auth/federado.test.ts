import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loginFederado } from "@/api/auth";
import { ApiError } from "@/api/client";
import { decodificarClaims, rolesDesdeClaims } from "./federado";

function jwt(claims: object): string {
  const base64url = (o: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${base64url({ alg: "RS256" })}.${base64url(claims)}.firma`;
}

describe("claims del Login Federado", () => {
  it("lee los claims del token, incluidos los acentos", () => {
    const token = jwt({ sub: "u1", name: "Maria Peña", groups: ["reclamos-operadores"] });
    expect(decodificarClaims(token)).toMatchObject({ sub: "u1", name: "Maria Peña" });
  });

  it("devuelve null si el token no es un JWT", () => {
    expect(decodificarClaims("no-es-un-jwt")).toBeNull();
    expect(decodificarClaims("a.%%%.c")).toBeNull();
  });

  it("mapea los grupos de Reclamos a roles y descarta los ajenos", () => {
    expect(rolesDesdeClaims({ groups: ["reclamos-administradores", "otro-grupo"] })).toEqual([
      "admin",
    ]);
    expect(rolesDesdeClaims({ groups: "reclamos-operadores, reclamos-administradores" })).toEqual([
      "operador",
      "admin",
    ]);
    expect(rolesDesdeClaims({})).toEqual([]);
  });
});

describe("loginFederado", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  function respuesta(status: number, cuerpo: unknown) {
    return Promise.resolve(new Response(JSON.stringify(cuerpo), { status }));
  }

  it("manda usuario, contrasena y clientId, y arma la sesion desde el token", async () => {
    const token = jwt({
      sub: "delegado-rec",
      name: "Delegado Reclamos",
      email: "d@citypass.local",
      groups: ["reclamos-administradores"],
    });
    const fetchMock = vi.fn(() => respuesta(200, { access_token: token, expires_in: 900 }));
    vi.stubGlobal("fetch", fetchMock);

    const sesion = await loginFederado("delegado-rec", "x");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.citypass-login.pp.ua/auth/login");
    expect(JSON.parse(init.body as string)).toEqual({
      username: "delegado-rec",
      password: "x",
      clientId: "citypass-reclamos-web",
    });
    expect(sesion.access_token).toBe(token);
    expect(sesion.usuario).toEqual({
      id: "delegado-rec",
      nombre: "Delegado Reclamos",
      email: "d@citypass.local",
      roles: ["admin"],
    });
  });

  it("un 401 del IdP queda como credenciales incorrectas", async () => {
    vi.stubGlobal("fetch", () => respuesta(401, { detail: "bad" }));
    await expect(loginFederado("a", "b")).rejects.toMatchObject({
      status: 401,
      message: "Usuario o contrasena incorrectos",
    });
  });

  it("rechaza a un usuario sin grupos de Reclamos", async () => {
    const token = jwt({ sub: "u2", groups: ["residuos-operadores"] });
    vi.stubGlobal("fetch", () => respuesta(200, { access_token: token }));
    await expect(loginFederado("a", "b")).rejects.toMatchObject({ status: 403 });
  });

  it("si el IdP no responde, devuelve un error de red entendible", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("fail")));
    const error = await loginFederado("a", "b").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("red");
  });
});
