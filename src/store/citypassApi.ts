import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import { ApiError } from "@/api/client";
import * as notificacionesApi from "@/api/notificaciones";
import * as reclamosApi from "@/api/reclamos";
import type {
  BusquedaSimilares,
  CambioEstado,
  ComentarioOut,
  ConteoNotificaciones,
  Estadisticas,
  FiltroNotificaciones,
  FiltroReclamos,
  Notificacion,
  PaginaNotificaciones,
  Page,
  ReclamoBandeja,
  ReclamoCrear,
  ReclamoDetalle,
  ReclamoListado,
  ReclamoOut,
  ReclamoSimilar,
  ReclasificacionPedido,
  ResultadoMarcarTodas,
} from "@/api/types";

interface RtkApiError {
  status: number;
  message: string;
  code?: string;
}

type FiltroReclamosCache = FiltroReclamos & { usuario_cache?: string };

function tagsLista(
  result: Page<ReclamoListado> | undefined,
  listaId: string,
): Array<{ type: "Reclamo"; id: string }> {
  return result
    ? [
        ...result.items.map((reclamo) => ({ type: "Reclamo" as const, id: reclamo.id })),
        { type: "Reclamo" as const, id: listaId },
      ]
    : [{ type: "Reclamo" as const, id: listaId }];
}

async function ejecutar<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: RtkApiError }> {
  try {
    return { data: await fn() };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: { status: err.status, message: err.message, code: err.code } };
    }
    const message = err instanceof Error ? err.message : "Error inesperado";
    return { error: { status: 0, message } };
  }
}

export const citypassApi = createApi({
  reducerPath: "citypassApi",
  baseQuery: fakeBaseQuery<RtkApiError>(),
  tagTypes: ["Reclamo", "Comentarios", "Bandeja", "Estadisticas", "Similares", "Notificacion"],
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    crearReclamo: build.mutation<ReclamoOut, ReclamoCrear>({
      queryFn: (datos) => ejecutar(() => reclamosApi.crearReclamo(datos)),
      invalidatesTags: (_result, error) =>
        error ? [] : [{ type: "Reclamo", id: "LIST" }, "Bandeja", "Estadisticas", "Similares"],
    }),

    cambiarEstado: build.mutation<ReclamoOut, { id: string; cambio: CambioEstado }>({
      queryFn: ({ id, cambio }) => ejecutar(() => reclamosApi.cambiarEstado(id, cambio)),
      invalidatesTags: (_result, error, { id }) =>
        error
          ? []
          : [
              { type: "Reclamo", id },
              { type: "Reclamo", id: "LIST" },
              "Bandeja",
              "Estadisticas",
              "Similares",
              "Notificacion",
            ],
    }),

    reclasificar: build.mutation<ReclamoOut, { id: string; cambio: ReclasificacionPedido }>({
      queryFn: ({ id, cambio }) => ejecutar(() => reclamosApi.reclasificar(id, cambio)),
      invalidatesTags: (_result, error, { id }) =>
        error
          ? []
          : [
              { type: "Reclamo", id },
              { type: "Reclamo", id: "LIST" },
              "Bandeja",
              "Estadisticas",
              "Similares",
            ],
    }),

    comentar: build.mutation<ComentarioOut, { id: string; texto: string }>({
      queryFn: ({ id, texto }) => ejecutar(() => reclamosApi.comentar(id, texto)),
      invalidatesTags: (_result, error, { id }) =>
        error ? [] : [{ type: "Comentarios", id }, "Notificacion"],
    }),

    listarReclamos: build.query<Page<ReclamoListado>, FiltroReclamosCache | undefined>({
      queryFn: (args) => {
        const filtro = { ...(args ?? {}) };
        delete filtro.usuario_cache;
        return ejecutar(() => reclamosApi.listarReclamos(filtro));
      },
      providesTags: (result) => tagsLista(result, "LIST"),
    }),

    obtenerReclamo: build.query<ReclamoDetalle, string>({
      queryFn: (id) => ejecutar(() => reclamosApi.obtenerReclamo(id)),
      providesTags: (_result, _err, id) => [
        { type: "Reclamo", id },
        { type: "Comentarios", id },
      ],
    }),

    bandeja: build.query<Page<ReclamoBandeja>, { page?: number; size?: number } | undefined>({
      queryFn: (args) => ejecutar(() => reclamosApi.bandeja(args?.page ?? 1, args?.size ?? 20)),
      providesTags: [{ type: "Bandeja", id: "LIST" }],
    }),

    contarResueltos: build.query<number, void>({
      queryFn: () => ejecutar(() => reclamosApi.contarResueltos()),
      providesTags: [{ type: "Estadisticas", id: "RESUELTOS" }],
    }),

    estadisticas: build.query<Estadisticas, void>({
      queryFn: () => ejecutar(() => reclamosApi.estadisticas()),
      providesTags: [{ type: "Estadisticas", id: "GLOBAL" }],
    }),

    listarNotificaciones: build.query<PaginaNotificaciones, FiltroNotificaciones | undefined>({
      queryFn: (filtro) => ejecutar(() => notificacionesApi.listarNotificaciones(filtro ?? {})),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((notificacion) => ({
                type: "Notificacion" as const,
                id: notificacion.id,
              })),
              { type: "Notificacion" as const, id: "LIST" },
            ]
          : [{ type: "Notificacion" as const, id: "LIST" }],
    }),

    contarNotificaciones: build.query<ConteoNotificaciones, void>({
      queryFn: () => ejecutar(() => notificacionesApi.contarNotificaciones()),
      providesTags: [{ type: "Notificacion", id: "COUNT" }],
    }),

    marcarNotificacionLeida: build.mutation<Notificacion, string>({
      queryFn: (id) => ejecutar(() => notificacionesApi.marcarNotificacionLeida(id)),
      invalidatesTags: (_result, error, id) =>
        error
          ? []
          : [
              { type: "Notificacion", id },
              { type: "Notificacion", id: "LIST" },
              { type: "Notificacion", id: "COUNT" },
            ],
    }),

    marcarTodasNotificacionesLeidas: build.mutation<ResultadoMarcarTodas, void>({
      queryFn: () => ejecutar(() => notificacionesApi.marcarTodasNotificacionesLeidas()),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: "Notificacion", id: "LIST" },
              { type: "Notificacion", id: "COUNT" },
            ],
    }),

    similaresDe: build.query<ReclamoSimilar[], string>({
      queryFn: (id) => ejecutar(() => reclamosApi.similaresDe(id)),
      providesTags: (_r, _e, id) => [{ type: "Similares", id }],
    }),

    buscarSimilares: build.mutation<ReclamoSimilar[], BusquedaSimilares>({
      queryFn: (body) => ejecutar(() => reclamosApi.buscarSimilares(body)),
    }),

    adherir: build.mutation<{ reclamo_id: string; adhesiones_count: number }, string>({
      queryFn: (id) => ejecutar(() => reclamosApi.adherir(id)),
      invalidatesTags: (_res, error, id) =>
        error
          ? []
          : [
              { type: "Reclamo", id },
              { type: "Reclamo", id: "LIST" },
              { type: "Bandeja", id: "LIST" },
              "Similares",
              "Notificacion",
            ],
    }),
  }),
});

export const {
  useCrearReclamoMutation,
  useCambiarEstadoMutation,
  useReclasificarMutation,
  useComentarMutation,
  useListarReclamosQuery,
  useObtenerReclamoQuery,
  useBandejaQuery,
  useContarResueltosQuery,
  useEstadisticasQuery,
  useListarNotificacionesQuery,
  useContarNotificacionesQuery,
  useMarcarNotificacionLeidaMutation,
  useMarcarTodasNotificacionesLeidasMutation,
  useSimilaresDeQuery,
  useBuscarSimilaresMutation,
  useAdherirMutation,
} = citypassApi;
