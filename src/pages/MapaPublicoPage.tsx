import { useMemo, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { listarReclamos } from "@/api/reclamos";
import { useAuth } from "@/auth/AuthContext";
import { Rol } from "@/auth/roles";
import { EstadoReclamo, type CategoriaReclamo } from "@/domain/enums";
import {
  COLOR_HEX,
  ESTADO_COLOR,
  ESTADO_LABEL,
  opcionesCategoria,
  opcionesEstado,
} from "@/domain/labels";
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

/**
 * Public map of geolocated claims (US-11), filterable by category and state.
 * Shows no personal data of the citizen who created each claim.
 */
export function MapaPublicoPage() {
  const { usuario } = useAuth();
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);

  const { data, loading, error, reload } = useAsync(() => listarReclamos({ size: 100 }), []);

  // Ids of the current citizen's own claims, so the map can highlight them.
  const esCiudadano = usuario?.rol === Rol.CIUDADANO;
  const { data: mios } = useAsync(
    () =>
      esCiudadano && usuario
        ? listarReclamos({ ciudadano_id: usuario.id, size: 100 })
        : Promise.resolve(null),
    [esCiudadano, usuario?.id],
  );
  const misIds = useMemo(() => new Set((mios?.items ?? []).map((r) => r.id)), [mios]);

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
        icono={MapPin}
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
          <MapaReclamos reclamos={puntos} misIds={esCiudadano ? misIds : undefined} />
          <div className="mt-1 flex flex-wrap items-center gap-4 px-2 py-1.5">
            {esCiudadano && (
              <div className="flex items-center gap-1.5">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: "#2563a6", boxShadow: "0 0 0 2px #e6b566" }}
                />
                <span className="text-xs font-medium text-foreground">Mis reclamos</span>
              </div>
            )}
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
