import { useMemo, useState } from "react";
import { ArrowUpDown, Loader2, Newspaper, WifiOff } from "lucide-react";

import { listarReclamos } from "@/api/reclamos";
import type { CategoriaReclamo, EstadoReclamo } from "@/domain/enums";
import { opcionesCategoria, opcionesEstado } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";
import { barriosDisponibles, filtrarFeed, type OrdenFeed } from "@/features/reclamos/feed";

const TODAS = "todas";

const OPCIONES_ORDEN: { value: OrdenFeed; label: string }[] = [
  { value: "recientes", label: "Mas recientes" },
  { value: "antiguos", label: "Mas antiguos" },
  { value: "adhesiones", label: "Mas apoyados" },
];

/**
 * Public feed of the city's claims (US-06), filterable by category,
 * neighbourhood and status (US-07), and sortable by recency or support
 * (`orden`, backed by the same param the backend list accepts). Every card
 * links to the claim's detail.
 */
export function FeedPublicoPage() {
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [barrio, setBarrio] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoReclamo | null>(null);
  const [orden, setOrden] = useState<OrdenFeed>("recientes");

  const { data, loading, error, reload } = useAsync(
    () => listarReclamos({ size: 100, orden }),
    [orden],
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const barrios = useMemo(() => barriosDisponibles(items), [items]);
  const visibles = useMemo(
    () => filtrarFeed(items, { categoria, barrio, estado, orden }),
    [items, categoria, barrio, estado, orden],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Newspaper className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reclamos de la ciudad</h1>
          <p className="text-sm text-muted-foreground">
            Los reclamos reportados por los vecinos en toda la ciudad.
          </p>
        </div>
      </div>

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

          <Select value={barrio ?? TODAS} onValueChange={(v) => setBarrio(v === TODAS ? null : v)}>
            <SelectTrigger className="w-[190px]" aria-label="Filtrar por barrio">
              <SelectValue placeholder="Todos los barrios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todos los barrios</SelectItem>
              {barrios.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
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
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm tabular-nums">
            {visibles.length} {visibles.length === 1 ? "reclamo" : "reclamos"}
          </Badge>
          <Select value={orden} onValueChange={(v) => setOrden(v as OrdenFeed)}>
            <SelectTrigger className="w-[170px]" aria-label="Ordenar por">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPCIONES_ORDEN.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
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
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <WifiOff className="size-6" />
          </span>
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
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Newspaper className="size-6" />
          </span>
          <p className="font-medium">No hay reclamos para mostrar</p>
          <p className="text-sm text-muted-foreground">
            Todavia no hay reclamos publicos o ninguno coincide con los filtros elegidos.
          </p>
        </div>
      )}

      {!loading && !error && visibles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((reclamo) => (
            <ReclamoCard key={reclamo.id} reclamo={reclamo} />
          ))}
        </div>
      )}
    </div>
  );
}
