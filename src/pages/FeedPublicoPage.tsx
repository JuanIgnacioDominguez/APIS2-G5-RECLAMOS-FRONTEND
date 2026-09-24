import { useMemo, useState } from "react";
import {
  Clock,
  History,
  LayoutGrid,
  Loader2,
  MapPin,
  MapPinned,
  Newspaper,
  ThumbsUp,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import { listarReclamos } from "@/api/reclamos";
import { useAuth } from "@/auth/AuthContext";
import { Rol } from "@/auth/roles";
import type { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";
import { CATEGORIA_HEX, ESTADO_HEX, opcionesCategoria, opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONO_CATEGORIA, ICONO_ESTADO } from "@/features/reclamos/iconos";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";
import { barriosDisponibles, filtrarFeed, type OrdenFeed } from "@/features/reclamos/feed";

const TODAS = "todas";

const OPCIONES_ORDEN: { value: OrdenFeed; label: string; icon: LucideIcon }[] = [
  { value: "recientes", label: "Mas recientes", icon: Clock },
  { value: "antiguos", label: "Mas antiguos", icon: History },
  { value: "adhesiones", label: "Mas apoyados", icon: ThumbsUp },
];

/**
 * Public feed of the city's claims (US-06), filterable by category,
 * neighbourhood and status (US-07), and sortable by recency or support
 * (`orden`, backed by the same param the backend list accepts). Every card
 * links to the claim's detail.
 */
export function FeedPublicoPage() {
  const { usuario } = useAuth();
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [barrio, setBarrio] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);
  const [orden, setOrden] = useState<OrdenFeed>("recientes");

  const { data, loading, error, reload } = useAsync(
    () => listarReclamos({ size: 100, orden }),
    [orden],
  );
  const items = useMemo(() => data?.items ?? [], [data]);

  // Ids of the logged-in citizen's own claims, so the feed can flag which of
  // the city's claims are theirs ("Tuyo") vs a neighbour's ("De un vecino").
  const esCiudadano = usuario?.rol === Rol.CIUDADANO;
  const { data: mios } = useAsync(
    () =>
      esCiudadano && usuario
        ? listarReclamos({ ciudadano_id: usuario.id, size: 100 })
        : Promise.resolve(null),
    [esCiudadano, usuario?.id],
  );
  const misIds = useMemo(() => new Set((mios?.items ?? []).map((r) => r.id)), [mios]);
  const barrios = useMemo(() => barriosDisponibles(items), [items]);
  const visibles = useMemo(
    () => filtrarFeed(items, { categoria, barrio, estado, orden }),
    [items, categoria, barrio, estado, orden],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reclamos de la ciudad</h1>
          <p className="text-sm text-muted-foreground">
            Los reclamos reportados por los vecinos en toda la ciudad.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={categoria ?? TODAS}
            onValueChange={(v) => setCategoria(v === TODAS ? null : (v as CategoriaReclamo))}
          >
            <SelectTrigger className="w-[200px]" aria-label="Filtrar por categoria">
              <SelectValue placeholder="Todas las categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categoria</SelectLabel>
                <SelectItem value={TODAS}>
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="size-4 text-muted-foreground" />
                    Todas las categorias
                  </span>
                </SelectItem>
                <SelectSeparator />
                {opcionesCategoria().map((o) => {
                  const Icono = ICONO_CATEGORIA[o.value as CategoriaReclamo];
                  return (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex items-center gap-2">
                        <Icono
                          className="size-4"
                          style={{ color: CATEGORIA_HEX[o.value as CategoriaReclamo] }}
                        />
                        {o.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={barrio ?? TODAS} onValueChange={(v) => setBarrio(v === TODAS ? null : v)}>
            <SelectTrigger className="w-[190px]" aria-label="Filtrar por barrio">
              <SelectValue placeholder="Todos los barrios" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Barrio</SelectLabel>
                <SelectItem value={TODAS}>
                  <span className="flex items-center gap-2">
                    <MapPinned className="size-4 text-muted-foreground" />
                    Todos los barrios
                  </span>
                </SelectItem>
                <SelectSeparator />
                {barrios.map((b) => (
                  <SelectItem key={b} value={b}>
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      {b}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={estado ?? TODAS}
            onValueChange={(v) => setEstado(v === TODAS ? null : (v as EstadoReclamo))}
          >
            <SelectTrigger className="w-[190px]" aria-label="Filtrar por estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Estado</SelectLabel>
                <SelectItem value={TODAS}>
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="size-4 text-muted-foreground" />
                    Todos los estados
                  </span>
                </SelectItem>
                <SelectSeparator />
                {opcionesEstado().map((o) => {
                  const Icono = ICONO_ESTADO[o.value as EstadoReclamo];
                  return (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: ESTADO_HEX[o.value as EstadoReclamo] }}
                        />
                        <Icono className="size-4 text-muted-foreground" />
                        {o.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm tabular-nums">
            {visibles.length} {visibles.length === 1 ? "reclamo" : "reclamos"}
          </Badge>
          <Select value={orden} onValueChange={(v) => setOrden(v as OrdenFeed)}>
            <SelectTrigger className="w-[170px]" aria-label="Ordenar por">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ordenar por</SelectLabel>
                {OPCIONES_ORDEN.map((o) => {
                  const Icono = o.icon;
                  return (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex items-center gap-2">
                        <Icono className="size-4 text-muted-foreground" />
                        {o.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Cargando reclamos...
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <WifiOff className="size-9 text-destructive/80" strokeWidth={1.5} />
          <div>
            <p className="font-medium">No se pudo cargar</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && visibles.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Newspaper className="size-9 text-primary/70" strokeWidth={1.5} />
          <p className="font-medium">No hay reclamos para mostrar</p>
          <p className="text-sm text-muted-foreground">
            Todavia no hay reclamos publicos o ninguno coincide con los filtros elegidos.
          </p>
        </div>
      )}

      {!loading && !error && visibles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((reclamo) => (
            <ReclamoCard
              key={reclamo.id}
              reclamo={reclamo}
              autoria={esCiudadano ? (misIds.has(reclamo.id) ? "mio" : "ciudad") : undefined}
              origen={esCiudadano ? { label: "Reclamos de la ciudad", to: "/feed" } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
