import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { ESTADO_COLOR, ESTADO_LABEL, CATEGORIA_LABEL } from "@/domain/labels";
import { CENTRO_DEFAULT, type ReclamoUbicado } from "./coords";

// Map the theme color keys to hex, since Leaflet paths take raw colors.
const COLOR_HEX: Record<string, string> = {
  gray: "#64748b",
  azulUrbano: "#2563a6",
  ambar: "#d99838",
  verdeUrbano: "#4f8a72",
  rojoEmergencia: "#c83e4d",
};

/** Highlight color for the current user's own claims (gold ring). */
const MIO_ANILLO = "#e6b566";
const MIO_RELLENO = "#2563a6";

/**
 * Recomputes the map size after mount and frames the view. Without invalidateSize
 * the map often initializes before its container has its final width (inside a
 * card, behind a collapsing sidebar), leaving tiles unloaded. When there are
 * located claims we fit to them; otherwise we keep a tight city view so the frame
 * is filled by the city instead of the open river to the east.
 */
function AjustarVista({ reclamos }: { reclamos: ReclamoUbicado[] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (reclamos.length > 0) {
        const puntos = reclamos.map((r) => [r.latitud, r.longitud] as [number, number]);
        map.fitBounds(puntos, { padding: [48, 48], maxZoom: 15 });
      }
    }, 150);
    // Re-invalidate whenever the container resizes (e.g. the sidebar collapses),
    // otherwise Leaflet leaves a strip of tiles unloaded on the widened side.
    const obs = new ResizeObserver(() => map.invalidateSize());
    obs.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [map, reclamos]);
  return null;
}

/**
 * Public claims map (US-11): a colored dot per geolocated claim, tinted by state.
 * When `misIds` is given, the current user's own claims stand out with a gold
 * ring so they are easy to spot among the rest. The popup shows only category,
 * state and title, never the citizen's personal data.
 */
export function MapaReclamos({
  reclamos,
  misIds,
}: {
  reclamos: ReclamoUbicado[];
  misIds?: Set<string>;
}) {
  return (
    <MapContainer
      className="mapa-suave"
      center={CENTRO_DEFAULT}
      zoom={13}
      scrollWheelZoom
      style={{ height: 540, width: "100%", borderRadius: "0.75rem" }}
    >
      <AjustarVista reclamos={reclamos} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={19}
      />
      {reclamos.map((r) => {
        const mio = misIds?.has(r.id) ?? false;
        return (
          <CircleMarker
            key={r.id}
            center={[r.latitud, r.longitud]}
            radius={mio ? 11 : 8}
            pathOptions={{
              color: mio ? MIO_ANILLO : "#ffffff",
              weight: mio ? 3.5 : 2,
              fillColor: mio ? MIO_RELLENO : (COLOR_HEX[ESTADO_COLOR[r.estado]] ?? "#2563a6"),
              fillOpacity: 1,
            }}
          >
            <Popup>
              {mio && (
                <>
                  <strong style={{ color: MIO_RELLENO }}>Tu reclamo</strong>
                  <br />
                </>
              )}
              <strong>{r.titulo}</strong>
              <br />
              {CATEGORIA_LABEL[r.categoria]} · {ESTADO_LABEL[r.estado]}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
