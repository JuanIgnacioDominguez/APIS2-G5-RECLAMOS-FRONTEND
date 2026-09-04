import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { ESTADO_COLOR, ESTADO_LABEL, CATEGORIA_LABEL } from "@/domain/labels";
import { CENTRO_DEFAULT, type ReclamoUbicado } from "./coords";

// Map the theme color keys to hex, since Leaflet paths take raw colors.
const COLOR_HEX: Record<string, string> = {
  gray: "#868e96",
  azulUrbano: "#2563a6",
  ambar: "#d99838",
  verdeUrbano: "#4f8a72",
  rojoEmergencia: "#c83e4d",
};

/**
 * Public claims map (US-11): a colored dot per geolocated claim. The popup shows
 * only category, state and title, never the citizen's personal data.
 */
export function MapaReclamos({ reclamos }: { reclamos: ReclamoUbicado[] }) {
  return (
    <MapContainer
      center={CENTRO_DEFAULT}
      zoom={12}
      scrollWheelZoom
      style={{ height: 480, width: "100%", borderRadius: "var(--mantine-radius-md)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reclamos.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.latitud, r.longitud]}
          radius={9}
          pathOptions={{
            color: COLOR_HEX[ESTADO_COLOR[r.estado]] ?? "#2563a6",
            fillOpacity: 0.7,
            weight: 2,
          }}
        >
          <Popup>
            <strong>{r.titulo}</strong>
            <br />
            {CATEGORIA_LABEL[r.categoria]} · {ESTADO_LABEL[r.estado]}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
