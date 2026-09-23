import { useMemo, useState } from "react";
import { Loader2, Map } from "lucide-react";

import { listarReclamos } from "@/api/reclamos";
import { EstadoReclamo, type CategoriaReclamo } from "@/domain/enums";
import { ESTADO_COLOR, ESTADO_LABEL, opcionesCategoria, opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { EstadoError } from "@/components/EstadoError";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapaReclamos } from "@/features/mapa/MapaReclamos";
import { reclamosUbicados } from "@/features/mapa/coords";

const TODAS = "todas";

/** States worth surfacing in the map legend, in lifecycle order. */
const ESTADOS_LEYENDA: EstadoReclamo[] = [
  EstadoReclamo.RECIBIDO,
  EstadoReclamo.EN_PROCESO,
  EstadoReclamo.RESUELTO,
  EstadoReclamo.RECHAZADO,
];

// Brand color keys to hex, for the legend dots (CSS vars are not available here).
const COLOR_HEX: Record<string, string> = {
  gray: "#868e96",
  azulUrbano: "#2563a6",
  ambar: "#d99838",
  verdeUrbano: "#4f8a72",
  rojoEmergencia: "#c83e4d",
};

/**
 * Public map of geolocated claims (US-11), filterable by category and state.
 * Shows no personal data of the citizen who created each claim.
 */
export function MapaPublicoPage() {
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);

  const { data, loading, error, reload } = useAsync(() => listarReclamos({ size: 100 }), []);

  const puntos = useMemo(() => {
    const ubicados = reclamosUbicados(data?.items ?? []);
    return ubicados.filter(
      (r) =>
        (categoria === null || r.categoria === categoria) &&
        (estado === null || r.estado === estado),
    );
  }, [data, categoria, estado]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icono={Map}
        titulo="Mapa de reclamos"
        descripcion="Reclamos publicos reportados en la ciudad, sin datos personales."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={categoria ?? TODAS}
            onValueChange={(v) => setCategoria(v === TODAS ? null : (v as CategoriaReclamo))}
          >
            <SelectTrigger className="w-[190px]" aria-label="Filtrar por categoria">
              <SelectValue placeholder="Todas las categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas las categorias</SelectItem>
              {opcionesCategoria().map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={estado ?? TODAS}
            onValueChange={(v) => setEstado(v === TODAS ? null : (v as EstadoReclamo))}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filtrar por estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todos los estados</SelectItem>
              {opcionesEstado().map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="secondary" className="text-sm tabular-nums">
          {puntos.length} en el mapa
        </Badge>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Cargando mapa...
        </div>
      )}

      {error && <EstadoError mensaje={error} onReintentar={reload} />}

      {!loading && !error && (
        <div className="rounded-xl bg-card p-2 ring-1 ring-foreground/10">
          <MapaReclamos reclamos={puntos} />
          <div className="mt-1 flex flex-wrap gap-4 px-2 py-1.5">
            {ESTADOS_LEYENDA.map((e) => (
              <div key={e} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: COLOR_HEX[ESTADO_COLOR[e]] ?? "#2563a6" }}
                />
                <span className="text-xs text-muted-foreground">{ESTADO_LABEL[e]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
