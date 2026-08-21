import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/test/render";
import { USUARIOS_DEMO } from "./users";
import { RequireAuth } from "./RequireAuth";

function renderGuard(ruta: string, opts: { usuario?: (typeof USUARIOS_DEMO)[number] | null } = {}) {
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
    renderGuard("/privado", { usuario: USUARIOS_DEMO[0] });
    expect(screen.getByText("contenido privado")).toBeInTheDocument();
  });

  it("una seccion soloStaff rechaza a un ciudadano", () => {
    renderGuard("/backoffice", { usuario: USUARIOS_DEMO[0] }); // ciudadano
    expect(screen.getByText("reclamos")).toBeInTheDocument();
    expect(screen.queryByText("backoffice")).not.toBeInTheDocument();
  });

  it("una seccion soloStaff acepta a un operador", () => {
    renderGuard("/backoffice", { usuario: USUARIOS_DEMO[1] }); // operador
    expect(screen.getByText("backoffice")).toBeInTheDocument();
  });
});
