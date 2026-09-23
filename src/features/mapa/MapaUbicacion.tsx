import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet paths take raw colors, so map the brand key to hex here.
const AZUL_URBANO = "#2563a6";

/** Recomputes size after mount so tiles fill a card that sizes late. */
function AjustarVista({ punto }: { punto: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      map.setView(punto, 15);
    }, 150);
    const obs = new ResizeObserver(() => map.invalidateSize());
    obs.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [map, punto]);
  return null;
}

interface Props {
  latitud: number;
  longitud: number;
  /** Map height in pixels (default 240). */
  alto?: number;
}

/** Single-point mini map to show where a claim is located. */
export function MapaUbicacion({ latitud, longitud, alto = 240 }: Props) {
  const punto: [number, number] = [latitud, longitud];
  return (
    <MapContainer
      className="mapa-suave"
      center={punto}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: alto, width: "100%", borderRadius: "0.75rem" }}
    >
      <AjustarVista punto={punto} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={19}
      />
      <CircleMarker
        center={punto}
        radius={9}
        pathOptions={{ color: "#ffffff", weight: 2, fillColor: AZUL_URBANO, fillOpacity: 0.95 }}
      />
    </MapContainer>
  );
}
