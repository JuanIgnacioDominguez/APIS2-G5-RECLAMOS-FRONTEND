import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buscarDireccion,
  direccionDesdePunto,
  limpiarCacheDirecciones,
  sugerirDirecciones,
} from "./geocoding";

interface HitFalso {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  } as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function ultimaUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  return fetchMock.mock.calls.at(-1)![0] as URL;
}

afterEach(() => {
  vi.unstubAllGlobals();
  // The suggestion cache is module-level; clear it so cases do not share state.
  limpiarCacheDirecciones();
});

describe("sugerirDirecciones", () => {
  it("no consulta ni devuelve nada con menos de 4 caracteres", async () => {
    const fetchMock = mockFetch([]);
    expect(await sugerirDirecciones("av")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("arma lineas cortas: calle + numero y localidad + region (CABA)", async () => {
    const hits: HitFalso[] = [
      {
        lat: "-34.6",
        lon: "-58.4",
        display_name: "Avenida Corrientes, Balvanera, Buenos Aires, Argentina",
        address: {
          road: "Avenida Corrientes",
          house_number: "3200",
          suburb: "Balvanera",
          state: "Ciudad Autónoma de Buenos Aires",
        },
      },
    ];
    mockFetch(hits);
    const [s] = await sugerirDirecciones("Corrientes 3200");
    expect(s.principal).toBe("Avenida Corrientes 3200");
    expect(s.secundaria).toBe("Balvanera, CABA");
    expect(s.barrio).toBe("Balvanera");
    expect(s.etiqueta).toBe("Avenida Corrientes 3200 - Balvanera, CABA");
    expect(s.direccion).toBe("Avenida Corrientes 3200");
  });

  it("usa la localidad como barrio cuando no hay suburb (GBA)", async () => {
    const hits: HitFalso[] = [
      {
        lat: "-34.75",
        lon: "-58.4",
        display_name: "Avenida Hipólito Yrigoyen 8000, Banfield, Argentina",
        address: {
          road: "Avenida Hipólito Yrigoyen",
          house_number: "8000",
          town: "Banfield",
          state: "Buenos Aires",
        },
      },
    ];
    mockFetch(hits);
    const [s] = await sugerirDirecciones("Yrigoyen 8000");
    expect(s.barrio).toBe("Banfield");
    expect(s.secundaria).toBe("Banfield, Buenos Aires");
  });

  it("ordena por proximidad al centro indicado", async () => {
    const hits: HitFalso[] = [
      {
        lat: "-31.0",
        lon: "-64.0",
        display_name: "Lejos",
        address: { road: "Mitre", city: "Cordoba" },
      },
      {
        lat: "-34.61",
        lon: "-58.41",
        display_name: "Cerca",
        address: { road: "Mitre", city: "Lanus" },
      },
    ];
    mockFetch(hits);
    const res = await sugerirDirecciones("Mitre 500", { cerca: { lat: -34.6, lng: -58.4 } });
    expect(res.map((r) => r.latitud)).toEqual([-34.61, -31.0]);
  });

  it("aplica el viewbox de proximidad en la query", async () => {
    const fetchMock = mockFetch([]);
    await sugerirDirecciones("Mitre 500", { cerca: { lat: -34.6, lng: -58.4 } });
    const url = ultimaUrl(fetchMock);
    expect(url.searchParams.get("countrycodes")).toBe("ar");
    expect(url.searchParams.get("viewbox")).toBeTruthy();
    expect(url.searchParams.get("bounded")).toBe("0");
  });

  it("descarta candidatos con etiqueta repetida", async () => {
    const hit: HitFalso = {
      lat: "-34.6",
      lon: "-58.4",
      display_name: "x",
      address: { road: "Mitre", house_number: "500", suburb: "Centro", state: "Buenos Aires" },
    };
    mockFetch([hit, { ...hit, lat: "-34.61" }]);
    const res = await sugerirDirecciones("Mitre 500");
    expect(res).toHaveLength(1);
  });

  it("devuelve lista vacia si la respuesta no es ok", async () => {
    mockFetch([], false);
    expect(await sugerirDirecciones("Mitre 500")).toEqual([]);
  });
});

describe("buscarDireccion", () => {
  it("devuelve el primer candidato", async () => {
    mockFetch([{ lat: "-34.6", lon: "-58.4", display_name: "x", address: { road: "Mitre" } }]);
    const r = await buscarDireccion("Mitre 500");
    expect(r?.direccion).toBe("Mitre");
  });

  it("devuelve null cuando no hay resultados", async () => {
    mockFetch([]);
    expect(await buscarDireccion("Calle inexistente 999")).toBeNull();
  });
});

describe("direccionDesdePunto", () => {
  it("resuelve un punto a su direccion y barrio", async () => {
    mockFetch({
      display_name: "Avenida Rivadavia 800, Monserrat, Buenos Aires",
      address: { road: "Avenida Rivadavia", house_number: "800", suburb: "Monserrat" },
    });
    const r = await direccionDesdePunto(-34.6, -58.38);
    expect(r?.direccion).toBe("Avenida Rivadavia 800");
    expect(r?.barrio).toBe("Monserrat");
    expect(r?.latitud).toBe(-34.6);
  });

  it("cae al display_name cuando no hay calle", async () => {
    mockFetch({ display_name: "Monserrat, Buenos Aires", address: { suburb: "Monserrat" } });
    const r = await direccionDesdePunto(-34.6, -58.38);
    expect(r?.direccion).toBe("Monserrat, Buenos Aires");
  });

  it("devuelve null cuando la respuesta no es ok", async () => {
    mockFetch({}, false);
    expect(await direccionDesdePunto(-34.6, -58.38)).toBeNull();
  });

  it("devuelve null cuando no hay datos utiles", async () => {
    mockFetch({});
    expect(await direccionDesdePunto(-34.6, -58.38)).toBeNull();
  });
});
