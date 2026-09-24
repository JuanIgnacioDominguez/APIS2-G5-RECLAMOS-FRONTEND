import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { ReclamoResumen } from "@/api/types";
import { CATEGORIA_LABEL, ESTADO_HEX, ESTADO_LABEL } from "@/domain/labels";
import { CENTRO_DEFAULT, reclamosUbicados, type ReclamoUbicado } from "./coords";
import { TILES } from "./tiles";

function AjustarVista({ reclamos }: { reclamos: ReclamoUbicado[] }) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (reclamos.length === 0) return;
      const puntos = reclamos.map(
        (reclamo) => [reclamo.latitud, reclamo.longitud] as [number, number],
      );
      map.fitBounds(puntos, { padding: [32, 32], maxZoom: 13 });
    }, 100);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [map, reclamos]);

  return null;
}

export function DashboardMapaReclamos({
  reclamos,
  total,
}: {
  reclamos: ReclamoResumen[];
  total: number;
}) {
  const puntos = useMemo(() => reclamosUbicados(reclamos), [reclamos]);
  const muestraParcial = total > reclamos.length;

  return (
    <div
      role="region"
      aria-label="Mapa de reclamos geolocalizados"
      className="relative isolate h-[300px] overflow-hidden rounded-lg bg-muted"
    >
      <MapContainer
        className="mapa-suave h-full w-full"
        center={CENTRO_DEFAULT}
        zoom={12}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <AjustarVista reclamos={puntos} />
        <TileLayer
          attribution={TILES.attribution}
          url={TILES.url}
          subdomains={TILES.subdomains}
          maxZoom={TILES.maxZoom}
        />
        <ZoomControl position="topleft" />
        {puntos.map((reclamo) => (
          <CircleMarker
            key={reclamo.id}
            center={[reclamo.latitud, reclamo.longitud]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 2.5,
              fillColor: ESTADO_HEX[reclamo.estado],
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="flex min-w-44 flex-col gap-1.5">
                <strong className="text-sm leading-snug">{reclamo.titulo}</strong>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{CATEGORIA_LABEL[reclamo.categoria]}</span>
                  <span>{ESTADO_LABEL[reclamo.estado]}</span>
                  <span>{reclamo.barrio ?? "Sin barrio"}</span>
                </div>
                <Link
                  to={`/reclamos/${reclamo.id}`}
                  state={{ origen: { label: "Dashboard", to: "/dashboard" } }}
                  className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver detalle
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="absolute right-3 bottom-3 left-3 z-[500] flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <span className="font-medium">
          {puntos.length} de {reclamos.length} reclamos cargados tienen coordenadas.
        </span>
        {muestraParcial && (
          <span className="text-muted-foreground">
            Mostrando {reclamos.length} recientes de {total}.
          </span>
        )}
      </div>
    </div>
  );
}
