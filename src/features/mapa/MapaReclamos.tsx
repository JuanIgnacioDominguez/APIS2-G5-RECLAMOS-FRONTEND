import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { CATEGORIA_LABEL, ESTADO_HEX, ESTADO_LABEL } from "@/domain/labels";
import { CategoriaIcono } from "@/features/reclamos/EstadoBadges";
import { CENTRO_DEFAULT, type ReclamoUbicado } from "./coords";
import { TILES } from "./tiles";

const MIO_ANILLO = "#22c55e";

function AjustarVista({ reclamos }: { reclamos: ReclamoUbicado[] }) {
  const map = useMap();
  useEffect(() => {
    const initialFrame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
      if (reclamos.length > 0) {
        const puntos = reclamos.map((r) => [r.latitud, r.longitud] as [number, number]);
        map.fitBounds(puntos, { padding: [48, 48], maxZoom: 15, animate: false });
      }
    });

    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    });
    observer.observe(map.getContainer());

    return () => {
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
    };
  }, [map, reclamos]);
  return null;
}

export function MapaReclamos({
  reclamos,
  misIds,
  fill = false,
}: {
  reclamos: ReclamoUbicado[];
  misIds?: Set<string>;
  fill?: boolean;
}) {
  return (
    <MapContainer
      className="mapa-suave"
      center={CENTRO_DEFAULT}
      zoom={13}
      scrollWheelZoom
      zoomControl={false}
      preferCanvas
      style={
        fill
          ? { height: "100%", width: "100%" }
          : { height: 540, width: "100%", borderRadius: "0.75rem" }
      }
    >
      <AjustarVista reclamos={reclamos} />
      <ZoomControl position="topright" />
      <TileLayer
        attribution={TILES.attribution}
        url={TILES.url}
        subdomains={TILES.subdomains}
        maxZoom={TILES.maxZoom}
        keepBuffer={1}
      />
      {reclamos.map((r) => {
        const mio = misIds?.has(r.id) ?? false;
        return (
          <CircleMarker
            key={r.id}
            center={[r.latitud, r.longitud]}
            radius={mio ? 12 : 9}
            pathOptions={{
              color: mio ? MIO_ANILLO : "#ffffff",
              weight: mio ? 3 : 2.5,
              fillColor: ESTADO_HEX[r.estado] ?? "#2563a6",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="flex min-w-[12rem] flex-col gap-1.5">
                {mio && (
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: MIO_ANILLO }}
                  >
                    Tu reclamo
                  </span>
                )}
                <strong className="text-sm leading-snug">{r.titulo}</strong>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CategoriaIcono categoria={r.categoria} className="size-3.5" />
                    {CATEGORIA_LABEL[r.categoria]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: ESTADO_HEX[r.estado] ?? "#2563a6" }}
                    />
                    {ESTADO_LABEL[r.estado]}
                  </span>
                </div>
                <Link
                  to={`/reclamos/${r.id}`}
                  state={{ origen: { label: "Mapa de reclamos", to: "/mapa" } }}
                  className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver detalle
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
