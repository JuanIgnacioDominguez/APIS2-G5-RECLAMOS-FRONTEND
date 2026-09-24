import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import { ApiError } from "@/api/client";
import * as notificacionesApi from "@/api/notificaciones";
import type { Notificacion } from "@/api/types";
import { EstadoReclamo } from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { CIUDADANO } from "@/test/usuarios";
import { NotificacionesPage } from "./NotificacionesPage";

const notificacion: Notificacion = {
  id: "not-1",
  tipo: "ESTADO",
  reclamo_id: "rec-1",
  titulo: "Tu reclamo pasó a En revisión",
  mensaje: "El reclamo está siendo revisado.",
  estado_nuevo: EstadoReclamo.EN_REVISION,
  created_at: "2026-08-15T08:59:12Z",
  leida: false,
  leida_at: null,
};

function paginaNotificaciones(items: Notificacion[], unreadCount = items.length) {
  return {
    items,
    total: items.length,
    page: 1,
    size: 50,
    unread_count: unreadCount,
  };
}

function renderPagina() {
  return renderWithProviders(
    <Routes>
      <Route path="/notificaciones" element={<NotificacionesPage />} />
      <Route path="/reclamos/:id" element={<div>detalle del reclamo</div>} />
    </Routes>,
    { route: "/notificaciones", usuario: CIUDADANO },
  );
}

describe("NotificacionesPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("lista una notificacion y navega al reclamo marcandola como leida", async () => {
    vi.spyOn(notificacionesApi, "listarNotificaciones").mockResolvedValue(
      paginaNotificaciones([notificacion]),
    );
    const marcarSpy = vi
      .spyOn(notificacionesApi, "marcarNotificacionLeida")
      .mockResolvedValue({ ...notificacion, leida: true, leida_at: "2026-08-15T09:00:00Z" });

    renderPagina();

    expect(await screen.findByText(notificacion.titulo)).toBeInTheDocument();
    expect(screen.getByText("Nueva")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Tu reclamo pasó a En revisión/i }));

    expect(marcarSpy).toHaveBeenCalledWith(notificacion.id);
    expect(await screen.findByText("detalle del reclamo")).toBeInTheDocument();
  });

  it("permite marcar todas las notificaciones como leidas", async () => {
    vi.spyOn(notificacionesApi, "listarNotificaciones").mockResolvedValue(
      paginaNotificaciones([notificacion]),
    );
    const marcarTodasSpy = vi
      .spyOn(notificacionesApi, "marcarTodasNotificacionesLeidas")
      .mockResolvedValue({ leidas: 1 });

    renderPagina();
    await screen.findByText(notificacion.titulo);
    await userEvent.click(screen.getByRole("button", { name: /marcar todas como leídas/i }));

    await waitFor(() => expect(marcarTodasSpy).toHaveBeenCalledOnce());
  });

  it("distingue un endpoint ausente de una bandeja vacia y permite reintentar", async () => {
    const listar = vi
      .spyOn(notificacionesApi, "listarNotificaciones")
      .mockRejectedValue(new ApiError(404, "Endpoint no disponible"));

    renderPagina();

    expect(await screen.findByText("Notificaciones no disponibles")).toBeInTheDocument();
    expect(screen.queryByText("Sin novedades")).not.toBeInTheDocument();
    listar.mockResolvedValue(paginaNotificaciones([]));
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Sin novedades")).toBeInTheDocument();
  });
});
