import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";

import { theme } from "@/theme/theme";

/**
 * Render a component inside the providers the app relies on: Mantine theme and
 * a router. `route` seeds the router's initial location.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = "/", ...options }: RenderOptions & { route?: string } = {},
) {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MantineProvider>,
    options,
  );
}
