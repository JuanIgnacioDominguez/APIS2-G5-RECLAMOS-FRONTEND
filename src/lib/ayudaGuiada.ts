/**
 * Guided-tour preference: is the floating help button visible or hidden.
 * Stored in localStorage so the choice persists across reloads. Pure module,
 * no React, so it can be tested directly.
 */

const STORAGE_KEY = "citypass.ayuda.activa";

/** True when the user has not opted out. Default: enabled. */
export function ayudaActiva(): boolean {
  try {
    // Any value other than the explicit "0" means "on", so the default is on.
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

/** Save the new preference and return it. */
export function establecerAyudaActiva(activa: boolean): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, activa ? "1" : "0");
  } catch {
    // storage unavailable: keep in-session behaviour only
  }
  return activa;
}

/**
 * Subscribe to preference changes. Fires when another tab (or a listener in
 * the same tab, via the dispatched CustomEvent) changes the flag, so the UI
 * updates without a page reload.
 */
export function suscribirAyuda(onCambio: () => void): () => void {
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) onCambio();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener("citypass:ayuda-cambio", onCambio);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("citypass:ayuda-cambio", onCambio);
  };
}

/** Emits the same-tab notification the subscriber above listens to. */
export function notificarCambioAyuda(): void {
  window.dispatchEvent(new CustomEvent("citypass:ayuda-cambio"));
}
