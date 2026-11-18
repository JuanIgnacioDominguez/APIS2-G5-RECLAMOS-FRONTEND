import { afterEach, describe, expect, it, vi } from "vitest";

import { listarAlertasActivas } from "./alertas";

describe("listarAlertasActivas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("pide las alertas vigentes al endpoint del staff", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("[]", { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);

    const alertas = await listarAlertasActivas();

    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(url).toMatch(/\/alertas-climaticas\/activas$/);
    expect(alertas).toEqual([]);
  });
});
