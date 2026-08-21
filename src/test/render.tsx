import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";

import { theme } from "@/theme/theme";
import { AuthProvider } from "@/auth/AuthContext";
import type { Usuario } from "@/auth/users";

interface Options extends RenderOptions {
  /** Initial router location. */
  route?: string;
  /** Seed an authenticated user (skips going through the login flow). */
  usuario?: Usuario | null;
}

/**
 * Render a component inside the providers the app relies on: Mantine theme,
 * router and auth. `route` seeds the location; `usuario` seeds the session.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = "/", usuario = null, ...options }: Options = {},
) {
  return render(
    <MantineProvider theme={theme}>
      <AuthProvider usuarioInicial={usuario}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthProvider>
    </MantineProvider>,
    options,
  );
}
