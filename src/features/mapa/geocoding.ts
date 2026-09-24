/**
 * Thin wrapper over OpenStreetMap's Nominatim geocoder (no API key). Keeps the
 * address field and the map pin in sync: an address resolves to a real point,
 * and a point resolves back to a real street address. Searches are biased toward
 * a proximity centre (the current pin, the citizen's location, or Greater Buenos
 * Aires by default) and re-ranked by distance, so a bare "Mitre 500" surfaces the
 * nearby one instead of a namesake in another province.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org";

/** Fallback proximity centre: Greater Buenos Aires (covers CABA + GBA sur/norte/oeste). */
export const CENTRO_AMBA = { lat: -34.68, lng: -58.42 };

/** A place resolved by the geocoder, in the shape the claim form consumes. */
export interface UbicacionGeocodificada {
  latitud: number;
  longitud: number;
  direccion: string;
  barrio: string | null;
}

/** An autocomplete candidate: a place plus two short lines for the dropdown. */
export interface SugerenciaDireccion extends UbicacionGeocodificada {
  /** First line: the street (e.g. "Av. Mitre 500"). */
  principal: string;
  /** Second line: locality and region (e.g. "Avellaneda, Buenos Aires"). */
  secundaria: string;
  /** Unique value for the Mantine Autocomplete option. */
  etiqueta: string;
}

// Nominatim's structured address bag (only the parts we read).
interface DireccionOSM {
  road?: string;
  pedestrian?: string;
  footway?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
}

interface HitOSM {
  lat: string;
  lon: string;
  display_name: string;
  address?: DireccionOSM;
}

function formatearCalle(a: DireccionOSM | undefined): string | null {
  if (!a) return null;
  const calle = a.road ?? a.pedestrian ?? a.footway;
  if (!calle) return null;
  return a.house_number ? `${calle} ${a.house_number}` : calle;
}

function barrioDe(a: DireccionOSM | undefined): string | null {
  return a?.suburb ?? a?.neighbourhood ?? a?.city_district ?? null;
}

/** The "barrio" field: the CABA neighbourhood, or the GBA locality as fallback. */
function barrioOZona(a: DireccionOSM | undefined): string | null {
  return barrioDe(a) ?? localidadDe(a);
}

function localidadDe(a: DireccionOSM | undefined): string | null {
  return (
    a?.suburb ??
    a?.neighbourhood ??
    a?.city ??
    a?.town ??
    a?.village ??
    a?.city_district ??
    a?.county ??
    null
  );
}

function regionCorta(a: DireccionOSM | undefined): string | null {
  const s = a?.state;
  if (!s) return null;
  if (/aut[oó]noma/i.test(s)) return "CABA";
  return s.replace(/^Provincia de /i, "");
}

/** Build a suggestion with short display lines from a raw Nominatim hit. */
function aSugerencia(hit: HitOSM): SugerenciaDireccion {
  const calle = formatearCalle(hit.address);
  const localidad = localidadDe(hit.address);
  const region = regionCorta(hit.address);
  const principal = calle ?? localidad ?? hit.display_name.split(",")[0].trim();
  const partesSec = [localidad && localidad !== principal ? localidad : null, region].filter(
    Boolean,
  );
  const secundaria = partesSec.join(", ");
  return {
    latitud: Number(hit.lat),
    longitud: Number(hit.lon),
    direccion: calle ?? principal,
    barrio: barrioOZona(hit.address),
    principal,
    secundaria,
    etiqueta: secundaria ? `${principal} - ${secundaria}` : principal,
  };
}

/** Squared planar distance; fine for ranking nearby candidates. */
function distancia2(aLat: number, aLng: number, bLat: number, bLng: number): number {
  return (aLat - bLat) ** 2 + (aLng - bLng) ** 2;
}

function viewboxAlrededor(centro: { lat: number; lng: number }): string {
  const dLat = 0.45;
  const dLng = 0.55;
  return `${centro.lng - dLng},${centro.lat + dLat},${centro.lng + dLng},${centro.lat - dLat}`;
}

interface OpcionesGeocodificar {
  cerca?: { lat: number; lng: number };
  signal?: AbortSignal;
}

async function pedir(params: Record<string, string>, signal?: AbortSignal): Promise<HitOSM[]> {
  const url = new URL(`${NOMINATIM}/search`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "Accept-Language": "es" }, signal });
  if (!res.ok) return [];
  return (await res.json()) as HitOSM[];
}

/**
 * Cache of already-resolved autocomplete queries, keyed by the normalized text
 * and the proximity centre. Nominatim rate-limits to ~1 req/s, so re-typing or
 * deleting back to a previous prefix must not fire the request again.
 */
const cacheSugerencias = new Map<string, SugerenciaDireccion[]>();

function claveCache(q: string, centro: { lat: number; lng: number }): string {
  return `${q.toLowerCase()}@${centro.lat.toFixed(2)},${centro.lng.toFixed(2)}`;
}

/** Clears the suggestion cache. Used by tests to isolate each case. */
export function limpiarCacheDirecciones(): void {
  cacheSugerencias.clear();
}

/**
 * Autocomplete: real candidates for what the citizen is typing, ranked by
 * proximity to `cerca` (defaults to Greater Buenos Aires). Empty under 4 chars.
 * Results are cached per query+centre to stay within Nominatim's rate limit.
 */
export async function sugerirDirecciones(
  texto: string,
  opts: OpcionesGeocodificar = {},
): Promise<SugerenciaDireccion[]> {
  const q = texto.trim();
  if (q.length < 4) return [];
  const centro = opts.cerca ?? CENTRO_AMBA;

  const clave = claveCache(q, centro);
  const enCache = cacheSugerencias.get(clave);
  if (enCache) return enCache;

  const hits = await pedir(
    {
      format: "jsonv2",
      q,
      countrycodes: "ar",
      addressdetails: "1",
      limit: "12",
      viewbox: viewboxAlrededor(centro),
      bounded: "0",
    },
    opts.signal,
  );

  const vistas = new Set<string>();
  const sugerencias = hits
    .sort(
      (a, b) =>
        distancia2(Number(a.lat), Number(a.lon), centro.lat, centro.lng) -
        distancia2(Number(b.lat), Number(b.lon), centro.lat, centro.lng),
    )
    .map(aSugerencia)
    .filter((s) => {
      if (vistas.has(s.etiqueta)) return false;
      vistas.add(s.etiqueta);
      return true;
    })
    .slice(0, 6);

  cacheSugerencias.set(clave, sugerencias);
  return sugerencias;
}

/** Forward geocoding: free-text address to a real nearby point. Null if none. */
export async function buscarDireccion(
  texto: string,
  cerca?: { lat: number; lng: number },
): Promise<UbicacionGeocodificada | null> {
  const [mejor] = await sugerirDirecciones(texto, { cerca });
  return mejor ?? null;
}

/** Reverse geocoding: a point to its real street address. Null if it fails. */
export async function direccionDesdePunto(
  lat: number,
  lng: number,
): Promise<UbicacionGeocodificada | null> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, { headers: { "Accept-Language": "es" } });
  if (!res.ok) return null;
  const hit = (await res.json()) as HitOSM;
  if (!hit?.display_name && !hit?.address) return null;
  return {
    latitud: lat,
    longitud: lng,
    direccion: formatearCalle(hit.address) ?? hit.display_name ?? "",
    barrio: barrioOZona(hit.address),
  };
}
