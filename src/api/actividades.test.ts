import { afterEach, describe, expect, it, vi } from "vitest";

import { listarActividades } from "./actividades";

describe("listarActividades", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubFetch() {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("[]", { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("pide las actividades vigentes por defecto", async () => {
    const fetchMock = stubFetch();
    await listarActividades();
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(url).toMatch(/\/actividades$/);
  });

  it("pide tambien las finalizadas cuando se lo indica", async () => {
    const fetchMock = stubFetch();
    await listarActividades(true);
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(url).toMatch(/\/actividades\?incluir_finalizadas=true$/);
  });
});
