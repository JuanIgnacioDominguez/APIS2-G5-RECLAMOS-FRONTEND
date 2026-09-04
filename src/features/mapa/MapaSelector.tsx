import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { CENTRO_DEFAULT } from "./coords";

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

/**
 * Location picker for the claim form (US-10): click on the map to set the
 * marker, or recenter it from the browser geolocation.
 */
export function MapaSelector({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : CENTRO_DEFAULT;
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: 260, width: "100%", borderRadius: "var(--mantine-radius-md)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <Recenter lat={lat} lng={lng} />
      {lat !== null && lng !== null && (
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{ color: "#2563a6", fillOpacity: 0.6, weight: 2 }}
        />
      )}
    </MapContainer>
  );
}
