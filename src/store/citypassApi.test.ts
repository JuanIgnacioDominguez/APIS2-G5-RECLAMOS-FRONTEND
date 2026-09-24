import { afterEach, describe, expect, it, vi } from "vitest";

import * as notificacionesApi from "@/api/notificaciones";
import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoListado, ReclamoDetalle } from "@/api/types";
import {
  CanalOrigen,
  OrigenClasificacion,
  CategoriaReclamo,
  EstadoReclamo,
  PrioridadReclamo,
} from "@/domain/enums";
import { citypassApi } from "./citypassApi";
import { crearStore } from "./store";

function resumen(id: string): ReclamoListado {
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
    es_propio: false,
  };
}

const pagina: Page<ReclamoListado> = { items: [resumen("1")], total: 1, page: 1, size: 20 };
const detalle: ReclamoDetalle = {
  ...resumen("1"),
  ciudadano_id: "vecino-1",
  descripcion: "Bache",
  origen_clasificacion: OrigenClasificacion.CIUDADANO,
  confianza_clasificacion: null,
  canal: CanalOrigen.APP,
  direccion: null,
  fotos: [],
  asignado_a: null,
  area_responsable: null,
  resolucion: null,
  correlation_id: null,
  updated_at: "2026-09-24T12:00:00Z",
  resuelto_at: null,
  cerrado_at: null,
  historial: [],
  comentarios: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("citypassApi", () => {
  it.each(["crear", "estado", "clasificacion"])(
    "%s actualiza listas, bandeja, totales y similares",
    async (operacion) => {
      const listar = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(pagina);
      const bandeja = vi
        .spyOn(reclamosApi, "bandeja")
        .mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });
      const resueltos = vi.spyOn(reclamosApi, "contarResueltos").mockResolvedValue(0);
      const similares = vi.spyOn(reclamosApi, "similaresDe").mockResolvedValue([]);
      const obtener = vi.spyOn(reclamosApi, "obtenerReclamo").mockResolvedValue(detalle);
      vi.spyOn(reclamosApi, "crearReclamo").mockResolvedValue(detalle);
      vi.spyOn(reclamosApi, "cambiarEstado").mockResolvedValue(detalle);
      vi.spyOn(reclamosApi, "reclasificar").mockResolvedValue(detalle);
      const store = crearStore();
      await Promise.all([
        store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined)),
        store.dispatch(citypassApi.endpoints.bandeja.initiate(undefined)),
        store.dispatch(citypassApi.endpoints.contarResueltos.initiate()),
        store.dispatch(citypassApi.endpoints.similaresDe.initiate("1")),
        store.dispatch(citypassApi.endpoints.obtenerReclamo.initiate("1")),
      ]);
      if (operacion === "crear") {
        await store.dispatch(
          citypassApi.endpoints.crearReclamo.initiate({
            titulo: "Bache",
            descripcion: "Bache nuevo",
          }),
        );
      } else if (operacion === "estado") {
        await store.dispatch(
          citypassApi.endpoints.cambiarEstado.initiate({
            id: "1",
            cambio: { estado: EstadoReclamo.RESUELTO },
          }),
        );
      } else {
        await store.dispatch(
          citypassApi.endpoints.reclasificar.initiate({
            id: "1",
            cambio: { categoria: CategoriaReclamo.BACHES },
          }),
        );
      }
      await vi.waitFor(() => {
        for (const consulta of [listar, bandeja, resueltos, similares])
          expect(consulta).toHaveBeenCalledTimes(2);
        expect(obtener).toHaveBeenCalledTimes(operacion === "crear" ? 1 : 2);
      });
      store.dispatch(citypassApi.util.resetApiState());
    },
  );

  it("comentar actualiza el detalle sin volver a pedir listados", async () => {
    const listar = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(pagina);
    const obtener = vi.spyOn(reclamosApi, "obtenerReclamo").mockResolvedValue(detalle);
    const comentario = {
      id: "c1",
      reclamo_id: "1",
      autor_id: "vecino-1",
      autor_nombre: "Vecino",
      texto: "Gracias",
      es_oficial: false,
      created_at: "2026-09-24T12:00:00Z",
    };
    vi.spyOn(reclamosApi, "comentar").mockResolvedValue(comentario);
    const store = crearStore();
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));
    await store.dispatch(citypassApi.endpoints.obtenerReclamo.initiate("1"));
    obtener.mockResolvedValue({ ...detalle, comentarios: [comentario] });
    await store.dispatch(citypassApi.endpoints.comentar.initiate({ id: "1", texto: "Gracias" }));
    await vi.waitFor(() =>
      expect(
        citypassApi.endpoints.obtenerReclamo.select("1")(store.getState()).data?.comentarios,
      ).toEqual([comentario]),
    );
    expect(listar).toHaveBeenCalledTimes(1);
    store.dispatch(citypassApi.util.resetApiState());
  });
  it("comparte una sola query entre el feed y Mis reclamos", async () => {
    const propia = { ...resumen("mio"), es_propio: true };
    const publica = resumen("publico");
    const spy = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue({
      ...pagina,
      items: [propia, publica],
      total: 2,
    });
    const store = crearStore();
    const args = { size: 100, orden: "recientes" as const, usuario_cache: "vecino-1" };

    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(args));
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(args));

    const cache = citypassApi.endpoints.listarReclamos.select(args)(store.getState());
    expect(cache.error).toBeUndefined();
    expect(cache.data?.items.map((reclamo) => reclamo.id)).toEqual(["mio", "publico"]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ size: 100, orden: "recientes" });
  });

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
    const actualizada = { ...pagina, items: [{ ...resumen("1"), adhesiones_count: 5 }] };
    const listar = vi
      .spyOn(reclamosApi, "listarReclamos")
      .mockResolvedValueOnce(pagina)
      .mockResolvedValue(actualizada);
    vi.spyOn(reclamosApi, "adherir").mockResolvedValue({
      reclamo_id: "1",
      adhesiones_count: 5,
    });
    const store = crearStore();
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));

    const antes = citypassApi.endpoints.listarReclamos.select(undefined)(store.getState());
    expect(antes.data).toBeDefined();

    await store.dispatch(citypassApi.endpoints.adherir.initiate("1"));

    await vi.waitFor(() => {
      const despues = citypassApi.endpoints.listarReclamos.select(undefined)(store.getState());
      expect(despues.data?.items[0].adhesiones_count).toBe(5);
    });
    expect(listar).toHaveBeenCalledTimes(2);
    store.dispatch(citypassApi.util.resetApiState());
  });

  it("no vuelve a consultar listas si la escritura falla", async () => {
    const listar = vi.spyOn(reclamosApi, "listarReclamos").mockResolvedValue(pagina);
    vi.spyOn(reclamosApi, "adherir").mockRejectedValue(new Error("Sin permisos"));
    const store = crearStore();
    await store.dispatch(citypassApi.endpoints.listarReclamos.initiate(undefined));
    const resultado = await store.dispatch(citypassApi.endpoints.adherir.initiate("1"));
    expect(resultado.error).toMatchObject({ message: "Sin permisos" });
    expect(listar).toHaveBeenCalledTimes(1);
    expect(citypassApi.endpoints.listarReclamos.select(undefined)(store.getState()).data).toEqual(
      pagina,
    );
    store.dispatch(citypassApi.util.resetApiState());
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

  it("consulta el contador de notificaciones desde el store", async () => {
    vi.spyOn(notificacionesApi, "contarNotificaciones").mockResolvedValue({ unread_count: 3 });
    const store = crearStore();

    const resultado = await store.dispatch(citypassApi.endpoints.contarNotificaciones.initiate());

    expect(resultado.data?.unread_count).toBe(3);
  });

  it("invalida la lista y el contador al marcar una notificacion", async () => {
    const listarSpy = vi.spyOn(notificacionesApi, "listarNotificaciones").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 50,
      unread_count: 0,
    });
    vi.spyOn(notificacionesApi, "marcarNotificacionLeida").mockResolvedValue({
      id: "not-1",
      tipo: "ESTADO",
      reclamo_id: "rec-1",
      titulo: "Cambio de estado",
      mensaje: "El reclamo cambió de estado.",
      estado_nuevo: "EN_REVISION",
      created_at: "2026-08-15T08:59:12Z",
      leida: true,
      leida_at: "2026-08-15T09:00:00Z",
    });
    const store = crearStore();

    await store.dispatch(
      citypassApi.endpoints.listarNotificaciones.initiate({ page: 1, size: 50 }),
    );
    await store.dispatch(citypassApi.endpoints.marcarNotificacionLeida.initiate("not-1"));

    expect(listarSpy).toHaveBeenCalledTimes(2);
  });
});
