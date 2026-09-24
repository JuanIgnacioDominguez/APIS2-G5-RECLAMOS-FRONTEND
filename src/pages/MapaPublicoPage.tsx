import { useMemo, useState } from "react";
import { ChevronDown, Loader2, MapPin } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { Rol } from "@/auth/roles";
import { EstadoReclamo, type CategoriaReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  ESTADO_HEX,
  ESTADO_LABEL,
  opcionesCategoria,
  opcionesEstado,
} from "@/domain/labels";
import { useListarReclamosQuery } from "@/store/citypassApi";
import { cn } from "cn";
import { EstadoError } from "@/components/EstadoError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoriaIcono } from "@/features/reclamos/EstadoBadges";
import { MapaReclamos } from "@/features/mapa/MapaReclamos";
import { reclamosUbicados } from "@/features/mapa/coords";

const TODAS = "todas";

const ESTADOS_LEYENDA: EstadoReclamo[] = [
  EstadoReclamo.RECIBIDO,
  EstadoReclamo.EN_REVISION,
  EstadoReclamo.ASIGNADO,
  EstadoReclamo.EN_PROCESO,
  EstadoReclamo.RESUELTO,
  EstadoReclamo.RECHAZADO,
  EstadoReclamo.CERRADO,
];

export function MapaPublicoPage() {
  const { usuario } = useAuth();
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(true);

  const { data, isLoading, error, refetch } = useListarReclamosQuery({
    size: 100,
    orden: "recientes",
    usuario_cache: usuario?.id,
  });
  const mensajeError =
    error && "message" in error && typeof error.message === "string" ? error.message : null;

  const esCiudadano = usuario?.rol === Rol.CIUDADANO;
  const misIds = useMemo(
    () =>
      new Set(
        (data?.items ?? []).filter((reclamo) => reclamo.es_propio).map((reclamo) => reclamo.id),
      ),
    [data],
  );

  const puntos = useMemo(() => {
    const ubicados = reclamosUbicados(data?.items ?? []);
    return ubicados.filter(
      (r) =>
        (categoria === null || r.categoria === categoria) &&
        (estado === null || r.estado === estado),
    );
  }, [data, categoria, estado]);

  return (
    <div
      data-slot="mapa-publico"
      className="relative isolate h-[calc(100dvh-4rem)] overflow-hidden"
    >
      <div data-tour="mapa-canvas" className="absolute inset-0">
        <MapaReclamos reclamos={puntos} misIds={esCiudadano ? misIds : undefined} fill />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1000] p-3 sm:p-4">
        <div className="pointer-events-auto ml-2 w-[min(20rem,calc(100%-1.5rem))] overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-xl ring-1 ring-border/80 sm:ml-3">
          <button
            type="button"
            onClick={() => setPanelAbierto((v) => !v)}
            aria-expanded={panelAbierto}
            aria-label={panelAbierto ? "Ocultar filtros del mapa" : "Mostrar filtros del mapa"}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.03]",
              panelAbierto && "border-b border-border/60",
            )}
          >
            <MapPin className="size-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">Mapa de reclamos</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">{puntos.length}</span>{" "}
                {puntos.length === 1 ? "reclamo" : "reclamos"} en el mapa
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                panelAbierto && "rotate-180",
              )}
            />
          </button>

          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
              panelAbierto
                ? "grid-rows-[1fr] opacity-100"
                : "pointer-events-none grid-rows-[0fr] opacity-0",
            )}
            aria-hidden={!panelAbierto}
          >
            <div className="min-h-0 overflow-hidden">
              <div data-tour="mapa-filtros" className="flex flex-col gap-3 p-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Categoria</span>
                  <Select
                    value={categoria ?? TODAS}
                    onValueChange={(v) =>
                      setCategoria(v === TODAS ? null : (v as CategoriaReclamo))
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-label="Filtrar por categoria"
                      tabIndex={panelAbierto ? 0 : -1}
                    >
                      <SelectValue placeholder="Todas las categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TODAS}>Todas las categorias</SelectItem>
                      {opcionesCategoria().map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          <CategoriaIcono
                            categoria={o.value as CategoriaReclamo}
                            className="size-4"
                          />
                          {CATEGORIA_LABEL[o.value as CategoriaReclamo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Estado</span>
                  <Select
                    value={estado ?? TODAS}
                    onValueChange={(v) => setEstado(v === TODAS ? null : (v as EstadoReclamo))}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-label="Filtrar por estado"
                      tabIndex={panelAbierto ? 0 : -1}
                    >
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

                <div
                  data-tour="mapa-leyenda"
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/60 pt-2.5"
                >
                  {esCiudadano && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="size-3 rounded-full border-2 bg-transparent"
                        style={{ borderColor: "var(--ownership-own)" }}
                      />
                      <span className="text-xs font-medium text-foreground">Mis reclamos</span>
                    </div>
                  )}
                  {ESTADOS_LEYENDA.map((e) => (
                    <div key={e} className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: ESTADO_HEX[e] ?? "#2563a6" }}
                      />
                      <span className="text-xs text-muted-foreground">{ESTADO_LABEL[e]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && !data && (
        <div className="pointer-events-none absolute inset-0 z-[1001] flex items-center justify-center bg-background/60">
          <span className="flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-sm text-muted-foreground shadow">
            <Loader2 className="size-5 animate-spin" />
            Cargando mapa...
          </span>
        </div>
      )}

      {error && !data && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-background/85 p-6">
          <div className="w-full max-w-md">
            <EstadoError mensaje={mensajeError} onReintentar={refetch} />
          </div>
        </div>
      )}
    </div>
  );
}
