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
    // ignore
  }
  return tema;
}

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
