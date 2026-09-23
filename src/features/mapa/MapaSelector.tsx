import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { CENTRO_DEFAULT } from "./coords";

/** Zoom level the map flies to once a location is set: close enough to place a pin precisely. */
const ZOOM_UBICACION = 17;

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  // Recompute the size once mounted, and again whenever the container resizes
  // (it now stretches to match the form column's height), so no tiles stay
  // unloaded (see MapaReclamos.AjustarVista, same fix).
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    const obs = new ResizeObserver(() => map.invalidateSize());
    obs.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [map]);
  // Every time a location is set (click, search, geolocation) fly in close on
  // it instead of just panning, so the pin lands clearly visible.
  useEffect(() => {
    if (lat === null || lng === null) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), ZOOM_UBICACION), { duration: 1 });
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
  altura = 260,
  className,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
  /** Map height in px. Defaults to the compact form-inline size; also doubles
   * as the flex-basis when the caller stretches the map with a flex class. */
  altura?: number;
  /** Extra class appended to the map, e.g. to make it flex-grow to fill a column. */
  className?: string;
}) {
  const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : CENTRO_DEFAULT;
  return (
    <MapContainer
      className={className ? `mapa-suave ${className}` : "mapa-suave"}
      center={center}
      zoom={13}
      style={{
        height: altura,
        width: "100%",
        borderRadius: "0.75rem",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={19}
      />
      <ClickHandler onPick={onPick} />
      <Recenter lat={lat} lng={lng} />
      {lat !== null && lng !== null && (
        <>
          <CircleMarker
            center={[lat, lng]}
            radius={22}
            pathOptions={{
              className: "mapa-marcador-halo",
              stroke: false,
              fillColor: "#2563a6",
              fillOpacity: 0.18,
            }}
          />
          <CircleMarker
            center={[lat, lng]}
            radius={9}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563a6", fillOpacity: 1 }}
          />
        </>
      )}
    </MapContainer>
  );
}
