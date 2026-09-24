/**
 * Central RTK Query slice for the Reclamos backend.
 *
 * Why RTK Query here: navigating between the sidebar screens (Bandeja, Todos
 * los reclamos, Feed, Mapa, Panel…) was re-firing the same GET every time
 * because each page's `useAsync` runs on mount. RTK Query deduplicates in-flight
 * calls, keeps the previous response cached, and revalidates in the background,
 * so tab switches feel instant and the network fires only when data actually
 * expires or is invalidated by a mutation.
 *
 * Each endpoint uses `queryFn` and calls into `@/api/reclamos`. That keeps a
 * single source of truth for how we talk to the backend (auth, 401, code-based
 * friendly errors) and lets our existing tests keep spying on `reclamosApi.X`
 * instead of stubbing `fetch`.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import { ApiError } from "@/api/client";
import * as reclamosApi from "@/api/reclamos";
import type {
  BusquedaSimilares,
  Estadisticas,
  FiltroReclamos,
  Page,
  ReclamoBandeja,
  ReclamoDetalle,
  ReclamoResumen,
  ReclamoSimilar,
} from "@/api/types";

/** Shape RTK Query returns for a failed request; keeps `code` for the UI. */
interface RtkApiError {
  status: number;
  message: string;
  code?: string;
}

/** Wraps a call to our API layer so any thrown ApiError becomes a typed error. */
async function ejecutar<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: RtkApiError }> {
  try {
    const data = await fn();
    return { data };
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
  // Tags let a mutation (create claim, adhere, change state…) invalidate every
  // list/detail that could be showing stale data, so no one has to remember to
  // reload by hand.
  tagTypes: ["Reclamo", "Bandeja", "Estadisticas", "Similares"],
  // Fresh-data window per cache entry (60s): a rapid tab-switch shows the
  // cached data instantly and does not refetch. After that RTK Query revalidates.
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    listarReclamos: build.query<Page<ReclamoResumen>, FiltroReclamos | undefined>({
      queryFn: (filtro) => ejecutar(() => reclamosApi.listarReclamos(filtro ?? {})),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((r) => ({ type: "Reclamo" as const, id: r.id })),
              { type: "Reclamo" as const, id: "LIST" },
            ]
          : [{ type: "Reclamo" as const, id: "LIST" }],
    }),

    obtenerReclamo: build.query<ReclamoDetalle, string>({
      queryFn: (id) => ejecutar(() => reclamosApi.obtenerReclamo(id)),
      providesTags: (_result, _err, id) => [{ type: "Reclamo", id }],
    }),

    bandeja: build.query<Page<ReclamoBandeja>, { page?: number; size?: number } | undefined>({
      queryFn: (args) => ejecutar(() => reclamosApi.bandeja(args?.page ?? 1, args?.size ?? 20)),
      providesTags: [{ type: "Bandeja", id: "LIST" }],
    }),

    estadisticas: build.query<Estadisticas, void>({
      queryFn: () => ejecutar(() => reclamosApi.estadisticas()),
      providesTags: [{ type: "Estadisticas", id: "GLOBAL" }],
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
      // Adhering changes the count in every list plus the detail card.
      invalidatesTags: (_res, _err, id) => [
        { type: "Reclamo", id },
        { type: "Reclamo", id: "LIST" },
        { type: "Bandeja", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListarReclamosQuery,
  useObtenerReclamoQuery,
  useBandejaQuery,
  useEstadisticasQuery,
  useSimilaresDeQuery,
  useBuscarSimilaresMutation,
  useAdherirMutation,
} = citypassApi;
