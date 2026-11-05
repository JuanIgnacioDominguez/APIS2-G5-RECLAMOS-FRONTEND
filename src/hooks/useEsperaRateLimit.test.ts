import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ESPERA_RATE_LIMIT_SEGUNDOS, useEsperaRateLimit } from "./useEsperaRateLimit";

describe("useEsperaRateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("arranca sin espera", () => {
    const { result } = renderHook(() => useEsperaRateLimit());
    expect(result.current.enEspera).toBe(false);
    expect(result.current.restante).toBe(0);
  });

  it("al iniciar entra en espera por la cantidad de segundos", () => {
    const { result } = renderHook(() => useEsperaRateLimit(3));
    act(() => result.current.iniciar());
    expect(result.current.enEspera).toBe(true);
    expect(result.current.restante).toBe(3);
  });

  it("cuenta hacia atras y se libera al llegar a cero", () => {
    const { result } = renderHook(() => useEsperaRateLimit(2));
    act(() => result.current.iniciar());

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.restante).toBe(1);
    expect(result.current.enEspera).toBe(true);

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.restante).toBe(0);
    expect(result.current.enEspera).toBe(false);
  });

  it("un nuevo 429 durante la espera reinicia la ventana", () => {
    const { result } = renderHook(() => useEsperaRateLimit(2));
    act(() => result.current.iniciar());
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.restante).toBe(1);

    act(() => result.current.iniciar());
    expect(result.current.restante).toBe(2);
  });

  it("el default son 60 segundos", () => {
    const { result } = renderHook(() => useEsperaRateLimit());
    act(() => result.current.iniciar());
    expect(result.current.restante).toBe(ESPERA_RATE_LIMIT_SEGUNDOS);
  });
});
