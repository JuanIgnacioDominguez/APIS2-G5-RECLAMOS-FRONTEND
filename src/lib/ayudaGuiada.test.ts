import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ayudaActiva,
  establecerAyudaActiva,
  notificarCambioAyuda,
  suscribirAyuda,
} from "./ayudaGuiada";

afterEach(() => {
  localStorage.clear();
});

describe("ayudaGuiada", () => {
  it("por defecto la ayuda esta activa", () => {
    expect(ayudaActiva()).toBe(true);
  });

  it("permite desactivar y persiste la preferencia", () => {
    establecerAyudaActiva(false);
    expect(ayudaActiva()).toBe(false);
    establecerAyudaActiva(true);
    expect(ayudaActiva()).toBe(true);
  });

  it("emite el evento al notificar cambios en la misma pestaña", () => {
    const onCambio = vi.fn();
    const desuscribir = suscribirAyuda(onCambio);
    notificarCambioAyuda();
    expect(onCambio).toHaveBeenCalledTimes(1);
    desuscribir();
    notificarCambioAyuda();
    // After unsubscribing no further calls arrive.
    expect(onCambio).toHaveBeenCalledTimes(1);
  });

  it("responde al evento 'storage' emitido por otras pestañas", () => {
    const onCambio = vi.fn();
    const desuscribir = suscribirAyuda(onCambio);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "citypass.ayuda.activa", newValue: "0" }),
    );
    expect(onCambio).toHaveBeenCalledTimes(1);
    desuscribir();
  });
});
