const STORAGE_KEY = "citypass.ayuda.activa";

export function ayudaActiva(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function establecerAyudaActiva(activa: boolean): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, activa ? "1" : "0");
  } catch {
    // ignore
  }
  return activa;
}

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

export function notificarCambioAyuda(): void {
  window.dispatchEvent(new CustomEvent("citypass:ayuda-cambio"));
}
