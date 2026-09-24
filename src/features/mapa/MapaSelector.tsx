import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { CENTRO_DEFAULT } from "./coords";
import { TILES } from "./tiles";

const ZOOM_UBICACION = 17;

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    const obs = new ResizeObserver(() => map.invalidateSize());
    obs.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [map]);
  useEffect(() => {
    if (lat === null || lng === null) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), ZOOM_UBICACION), { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

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
  altura?: number;
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
        boxShadow: "var(--popover-shadow)",
      }}
    >
      <TileLayer
        attribution={TILES.attribution}
        url={TILES.url}
        subdomains={TILES.subdomains}
        maxZoom={TILES.maxZoom}
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
