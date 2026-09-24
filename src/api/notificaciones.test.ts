import { beforeEach, describe, expect, it, vi } from "vitest";

import * as client from "./client";
import {
  contarNotificaciones,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from "./notificaciones";

describe("endpoints de notificaciones", () => {
  const requestSpy = vi.spyOn(client, "request");

  beforeEach(() => {
    requestSpy.mockReset();
    requestSpy.mockResolvedValue({} as never);
  });

  it("lista notificaciones con paginado y filtro de lectura", () => {
    listarNotificaciones({ page: 2, size: 20, unread_only: true });

    expect(requestSpy).toHaveBeenCalledWith("/notificaciones", {
      query: { page: 2, size: 20, unread_only: true },
    });
  });

  it("consulta el contador de no leidas", () => {
    contarNotificaciones();

    expect(requestSpy).toHaveBeenCalledWith("/notificaciones/conteo");
  });

  it("marca una notificacion como leida", () => {
    marcarNotificacionLeida("not-1");

    expect(requestSpy).toHaveBeenCalledWith("/notificaciones/not-1/leer", {
      method: "PATCH",
    });
  });

  it("marca todas las notificaciones como leidas", () => {
    marcarTodasNotificacionesLeidas();

    expect(requestSpy).toHaveBeenCalledWith("/notificaciones/leer-todas", {
      method: "POST",
    });
  });
});
