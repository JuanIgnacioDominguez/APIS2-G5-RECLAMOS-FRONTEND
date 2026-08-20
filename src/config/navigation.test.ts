import { describe, expect, it } from "vitest";

import { CUENTA, SERVICIOS, navItemPorRuta } from "./navigation";

describe("navegacion", () => {
  it("Reclamos es el unico servicio propio (ownerGroup null)", () => {
    const propios = SERVICIOS.filter((s) => s.ownerGroup === null);
    expect(propios).toHaveLength(1);
    expect(propios[0].to).toBe("/reclamos");
  });

  it("el resto de los servicios pertenece a otro grupo", () => {
    const ajenos = SERVICIOS.filter((s) => s.to !== "/reclamos");
    expect(ajenos.every((s) => s.ownerGroup !== null)).toBe(true);
  });

  it("navItemPorRuta encuentra items en ambos grupos de links", () => {
    expect(navItemPorRuta("/reclamos")?.label).toBe("Reclamos");
    expect(navItemPorRuta(CUENTA[0].to)?.label).toBe(CUENTA[0].label);
  });

  it("devuelve undefined para una ruta desconocida", () => {
    expect(navItemPorRuta("/no-existe")).toBeUndefined();
  });
});
