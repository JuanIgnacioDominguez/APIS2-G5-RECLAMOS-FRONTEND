import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "@/auth/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Usuario } from "@/auth/users";
import { crearStore } from "@/store/store";

type Store = ReturnType<typeof crearStore>;

interface Options extends RenderOptions {
  /** Initial router location. */
  route?: string;
  /** Seed an authenticated user (skips going through the login flow). */
  usuario?: Usuario | null;
  /** Reuse a store between renders (e.g. to exercise RTK Query's cache). */
  store?: Store;
}

/**
 * Render a component inside the providers the app relies on: redux store,
 * router and auth. A fresh store is created per render unless one is provided,
 * which keeps cache from leaking between tests but lets a test share the cache
 * across two renders when it needs to. `route` seeds the location; `usuario`
 * seeds the session.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = "/", usuario = null, store, ...options }: Options = {},
) {
  const activeStore = store ?? crearStore();
  return {
    ...render(
      <Provider store={activeStore}>
        <TooltipProvider delayDuration={0}>
          <AuthProvider usuarioInicial={usuario}>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </AuthProvider>
        </TooltipProvider>
      </Provider>,
      options,
    ),
    store: activeStore,
  };
}
