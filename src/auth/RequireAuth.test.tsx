import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { ADMIN, CIUDADANO, OPERADOR } from "@/test/usuarios";
import type { Usuario } from "./users";
import { RequireAuth } from "./RequireAuth";

function renderGuard(ruta: string, opts: { usuario?: Usuario | null } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>pantalla de login</div>} />
      <Route path="/reclamos" element={<div>reclamos</div>} />
      <Route element={<RequireAuth />}>
        <Route path="/privado" element={<div>contenido privado</div>} />
      </Route>
      <Route element={<RequireAuth soloStaff />}>
        <Route path="/backoffice" element={<div>backoffice</div>} />
      </Route>
      <Route element={<RequireAuth soloAdmin />}>
        <Route path="/panel" element={<div>panel admin</div>} />
      </Route>
    </Routes>,
    { route: ruta, usuario: opts.usuario ?? null },
  );
}

describe("RequireAuth", () => {
  it("sin sesion, redirige al login", () => {
    renderGuard("/privado");
    expect(screen.getByText("pantalla de login")).toBeInTheDocument();
  });

  it("con sesion, deja pasar", () => {
    renderGuard("/privado", { usuario: CIUDADANO });
    expect(screen.getByText("contenido privado")).toBeInTheDocument();
  });

  it("una seccion soloStaff rechaza a un ciudadano", () => {
    renderGuard("/backoffice", { usuario: CIUDADANO }); // ciudadano
    expect(screen.getByText("reclamos")).toBeInTheDocument();
    expect(screen.queryByText("backoffice")).not.toBeInTheDocument();
  });

  it("una seccion soloStaff acepta a un operador", () => {
    renderGuard("/backoffice", { usuario: OPERADOR }); // operador
    expect(screen.getByText("backoffice")).toBeInTheDocument();
  });

  it("una seccion soloAdmin rechaza a un operador", () => {
    renderGuard("/panel", { usuario: OPERADOR }); // operador
    expect(screen.queryByText("panel admin")).not.toBeInTheDocument();
    expect(screen.getByText("reclamos")).toBeInTheDocument();
  });

  it("una seccion soloAdmin acepta a un admin", () => {
    renderGuard("/panel", { usuario: ADMIN }); // admin
    expect(screen.getByText("panel admin")).toBeInTheDocument();
  });
});
