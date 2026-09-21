import type { ReclamoResumen } from "@/api/types";

/** Default map center: Ciudad Autonoma de Buenos Aires. */
export const CENTRO_DEFAULT: [number, number] = [-34.6037, -58.3816];

/** A claim that has usable coordinates (both latitude and longitude set). */
export interface ReclamoUbicado extends ReclamoResumen {
  latitud: number;
  longitud: number;
}

/** Keep only the claims that can be placed on the map. */
export function reclamosUbicados(items: ReclamoResumen[]): ReclamoUbicado[] {
  return items.filter((r): r is ReclamoUbicado => r.latitud !== null && r.longitud !== null);
}
