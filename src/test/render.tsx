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
  route?: string;
  usuario?: Usuario | null;
  store?: Store;
}

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
