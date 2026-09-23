import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "@/auth/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Usuario } from "@/auth/users";

interface Options extends RenderOptions {
  /** Initial router location. */
  route?: string;
  /** Seed an authenticated user (skips going through the login flow). */
  usuario?: Usuario | null;
}

/**
 * Render a component inside the providers the app relies on: router and auth.
 * `route` seeds the location; `usuario` seeds the session.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = "/", usuario = null, ...options }: Options = {},
) {
  return render(
    <TooltipProvider delayDuration={0}>
      <AuthProvider usuarioInicial={usuario}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthProvider>
    </TooltipProvider>,
    options,
  );
}
