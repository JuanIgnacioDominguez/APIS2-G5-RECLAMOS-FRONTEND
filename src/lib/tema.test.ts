import { afterEach, describe, expect, it } from "vitest";

import { alternarTema, aplicarTemaInicial, establecerTema, temaActual } from "./tema";

describe("tema", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  });

  it("arranca en claro aunque no haya preferencia guardada", () => {
    aplicarTemaInicial();
    expect(temaActual()).toBe("light");
  });

  it("alternar cambia el tema y lo guarda para la proxima carga", () => {
    expect(alternarTema()).toBe("dark");
    expect(localStorage.getItem("citypass.tema")).toBe("dark");

    document.documentElement.classList.remove("dark");
    aplicarTemaInicial();
    expect(temaActual()).toBe("dark");

    expect(alternarTema()).toBe("light");
    expect(temaActual()).toBe("light");
  });

  it("establece un tema exacto y sincroniza el color nativo", () => {
    establecerTema("dark");
    expect(temaActual()).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");

    establecerTema("light");
    expect(temaActual()).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("ignora un valor guardado invalido", () => {
    localStorage.setItem("citypass.tema", "azul");
    aplicarTemaInicial();
    expect(temaActual()).toBe("light");
  });
});
