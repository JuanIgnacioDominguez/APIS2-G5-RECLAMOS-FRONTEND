import { beforeEach, describe, expect, it, vi } from "vitest";

import * as client from "./client";
import {
  adherir,
  bandeja,
  cambiarEstado,
  comentar,
  crearReclamo,
  historial,
  listarComentarios,
  listarReclamos,
  obtenerReclamo,
  reclasificar,
  sugerirClasificacion,
} from "./reclamos";

describe("endpoints de reclamos", () => {
  const requestSpy = vi.spyOn(client, "request");

  beforeEach(() => {
    requestSpy.mockReset();
    requestSpy.mockResolvedValue({} as never);
  });

  it("listarReclamos pasa el filtro como query", () => {
    listarReclamos({ estado: "RECIBIDO", page: 2 } as never);
    expect(requestSpy).toHaveBeenCalledWith("/reclamos", {
      query: { estado: "RECIBIDO", page: 2 },
    });
  });

  it("obtenerReclamo arma la ruta con el id", () => {
    obtenerReclamo("abc");
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/abc");
  });

  it("crearReclamo hace POST con el body", () => {
    const datos = { titulo: "t", descripcion: "d" } as never;
    crearReclamo(datos);
    expect(requestSpy).toHaveBeenCalledWith("/reclamos", { method: "POST", body: datos });
  });

  it("cambiarEstado hace PATCH sobre /estado", () => {
    cambiarEstado("1", { estado: "ASIGNADO" } as never);
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/1/estado", {
      method: "PATCH",
      body: { estado: "ASIGNADO" },
    });
  });

  it("bandeja hace GET sobre /reclamos/bandeja con paginado", () => {
    bandeja(2, 50);
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/bandeja", { query: { page: 2, size: 50 } });
  });

  it("reclasificar hace PATCH sobre /clasificacion", () => {
    reclasificar("1", { categoria: "BACHES" } as never);
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/1/clasificacion", {
      method: "PATCH",
      body: { categoria: "BACHES" },
    });
  });

  it("sugerirClasificacion envia titulo y descripcion", () => {
    sugerirClasificacion("titulo", "descripcion larga");
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/clasificacion", {
      method: "POST",
      body: { titulo: "titulo", descripcion: "descripcion larga" },
    });
  });

  it("comentar hace POST sobre /comentarios", () => {
    comentar("1", "hola");
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/1/comentarios", {
      method: "POST",
      body: { texto: "hola" },
    });
  });

  it("listarComentarios hace GET sobre /comentarios", () => {
    listarComentarios("1");
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/1/comentarios");
  });

  it("adherir hace POST sobre /adhesiones", () => {
    adherir("1");
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/1/adhesiones", { method: "POST" });
  });

  it("historial hace GET sobre /historial", () => {
    historial("1");
    expect(requestSpy).toHaveBeenCalledWith("/reclamos/1/historial");
  });
});
