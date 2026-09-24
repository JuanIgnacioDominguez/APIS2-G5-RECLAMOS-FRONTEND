import { describe, expect, it } from "vitest";

import { CODIGO_RED, esErrorDeRed, mensajeDeError } from "./erroresApi";

describe("mensajeDeError", () => {
  it("mapea los codigos de dominio del backend a mensajes claros", () => {
    expect(mensajeDeError({ status: 409, code: "adhesion_del_autor" })).toMatch(
      /no podes sumarte a tu propio reclamo/i,
    );
    expect(mensajeDeError({ status: 409, code: "adhesion_duplicada" })).toMatch(/ya te sumaste/i);
    expect(mensajeDeError({ status: 404, code: "reclamo_no_encontrado" })).toMatch(/no existe/i);
    expect(mensajeDeError({ status: 409, code: "transicion_invalida" })).toMatch(
      /no esta permitido/i,
    );
  });

  it("usa el status cuando no hay un code conocido", () => {
    expect(mensajeDeError({ status: 403 })).toMatch(/no tenes permisos/i);
    expect(mensajeDeError({ status: 500 })).toMatch(/algo fallo/i);
  });

  it("devuelve null en 401 para que lo maneje el redirect al login", () => {
    expect(mensajeDeError({ status: 401 })).toBeNull();
  });

  it("devuelve null cuando no hay informacion util, para caer al texto crudo", () => {
    expect(mensajeDeError({ status: 418 })).toBeNull();
    expect(mensajeDeError({})).toBeNull();
  });

  it("tiene un mensaje para el error de red", () => {
    expect(mensajeDeError({ code: CODIGO_RED })).toMatch(/no pudimos conectar/i);
  });
});

describe("esErrorDeRed", () => {
  it("reconoce el codigo de red y el status 0", () => {
    expect(esErrorDeRed(CODIGO_RED)).toBe(true);
    expect(esErrorDeRed(undefined, 0)).toBe(true);
    expect(esErrorDeRed("interno", 500)).toBe(false);
  });
});
