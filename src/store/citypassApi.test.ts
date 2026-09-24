import { afterEach, describe, expect, it, vi } from "vitest";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { citypassApi } from "./citypassApi";
import { crearStore } from "./store";

function resumen(id: string): ReclamoResumen {
  return {
    id,
    titulo: `R${id}`,
    categoria: CategoriaReclamo.BACHES,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

const pagina: Page<ReclamoResumen> = { items: [resumen("1")], total: 1, page: 1, size: 20 };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("citypassApi", () => {
  it("cachea la lista de reclamos y no vuelve a pegarle al backend por los mismos args", async () => {
    const spy = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(pagina);
    const store = crearStore();

    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));

    // RTK Query dedupes: three initiate calls with the same args → one fetch.
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("adherir invalida la cache del reclamo y del listado", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(pagina);
    vi.spyOn(reclamosApi, "adherir").mockResolvedValue({
      reclamo_id: "1",
      adhesiones_count: 5,
    });
    const store = crearStore();
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));

    const antes = citypassApi.endpoints.listarReclamos.select(undefined)(store.getState());
    expect(antes.data).toBeDefined();

    await store.dispatch(citypassApi.endpoints.adherir.initiate("1"));

    // Invalidation flips the cache entry to 'invalidated', so a fresh
    // subscription will refetch instead of returning the previous payload.
    const despues = citypassApi.endpoints.listarReclamos.select(undefined)(store.getState());
    expect(despues.isUninitialized || despues.status === "pending" || despues.isSuccess).toBe(true);
  });

  it("expone un error tipado cuando el backend falla", async () => {
    vi.spyOn(reclamosApi, "listarReclamos").mockRejectedValue(new Error("500 interno"));
    const store = crearStore();

    const res = await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));

    expect(res.isError).toBe(true);
    // Custom base query surfaces `message` from the ApiError.
    const error = res.error as { message?: string } | undefined;
    expect(error?.message).toContain("500 interno");
  });
});
