/**
 * Light/dark theme handling for the shadcn tokens. The choice lives in
 * localStorage and is applied as the `dark` class on <html>, which is what the
 * `.dark` block in index.css keys off. No provider needed.
 */

export type Tema = "light" | "dark";

const STORAGE_KEY = "citypass.tema";

function leerPreferencia(): Tema | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Apply the theme before the app renders. Light is the agreed default and the
 * one the team uses, so we never follow the OS preference: dark mode is strictly
 * opt-in and only applies when the user chose it explicitly (stored value).
 */
function aplicarDom(tema: Tema): void {
  document.documentElement.classList.toggle("dark", tema === "dark");
  document.documentElement.style.colorScheme = tema;
}

export function aplicarTemaInicial(): void {
  aplicarDom(leerPreferencia() ?? "light");
}

export function temaActual(): Tema {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function establecerTema(tema: Tema): Tema {
  aplicarDom(tema);
  try {
    localStorage.setItem(STORAGE_KEY, tema);
  } catch {
    // storage unavailable: theme stays for this session only
  }
  return tema;
}

/** Flip the theme, persist it, and return the new value. */
export function alternarTema(): Tema {
  return establecerTema(temaActual() === "dark" ? "light" : "dark");
}

export function suscribirTema(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function temaServidor(): Tema {
  return "light";
}
