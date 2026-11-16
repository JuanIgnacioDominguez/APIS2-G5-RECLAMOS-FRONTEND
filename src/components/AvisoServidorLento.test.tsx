import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { AvisoServidorLento, MENSAJE_SERVIDOR_LENTO } from "./AvisoServidorLento";

describe("AvisoServidorLento", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no muestra nada mientras la espera es corta", () => {
    render(<AvisoServidorLento activo />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(MENSAJE_SERVIDOR_LENTO)).not.toBeInTheDocument();
  });

  it("explica la demora cuando la espera pasa de unos segundos", () => {
    render(<AvisoServidorLento activo />);
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(screen.getByRole("status")).toHaveTextContent(MENSAJE_SERVIDOR_LENTO);
  });

  it("desaparece cuando la carga termina", () => {
    const { rerender } = render(<AvisoServidorLento activo />);
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    rerender(<AvisoServidorLento activo={false} />);
    expect(screen.queryByText(MENSAJE_SERVIDOR_LENTO)).not.toBeInTheDocument();
  });

  it("no muestra nada si nunca estuvo cargando", () => {
    render(<AvisoServidorLento activo={false} />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.queryByText(MENSAJE_SERVIDOR_LENTO)).not.toBeInTheDocument();
  });
});
