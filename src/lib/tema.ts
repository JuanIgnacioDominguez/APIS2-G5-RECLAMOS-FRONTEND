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
export function aplicarTemaInicial(): void {
  const tema: Tema = leerPreferencia() ?? "light";
  document.documentElement.classList.toggle("dark", tema === "dark");
}

export function temaActual(): Tema {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Flip the theme, persist it, and return the new value. */
export function alternarTema(): Tema {
  const nuevo: Tema = temaActual() === "dark" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", nuevo === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, nuevo);
  } catch {
    // storage unavailable: theme stays for this session only
  }
  return nuevo;
}
