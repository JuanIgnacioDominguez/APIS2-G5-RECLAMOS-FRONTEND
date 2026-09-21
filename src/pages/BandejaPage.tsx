import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Eye,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  WifiOff,
} from "lucide-react";

import { bandeja } from "@/api/reclamos";
import { EstadoReclamo, OrigenClasificacion } from "@/domain/enums";
import { haceCuanto, idCorto } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CategoriaBadge,
  EstadoBadge,
  IaBadge,
  PrioridadBadge,
} from "@/features/reclamos/EstadoBadges";

/**
 * Backoffice inbox for operators and admins (US-13). Reads `/reclamos/bandeja`
 * (incoming claims, newest first) and tops it with KPI cards computed from the
 * same list, so staff see the shape of the queue at a glance.
 */
export function BandejaPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => bandeja(), []);
  const [texto, setTexto] = useState("");

  const filas = useMemo(() => data?.items ?? [], [data]);
  const kpis = useMemo(
    () => ({
      entrantes: filas.length,
      recibidos: filas.filter((r) => r.estado === EstadoReclamo.RECIBIDO).length,
      enRevision: filas.filter((r) => r.estado === EstadoReclamo.EN_REVISION).length,
      ia: filas.filter((r) => r.origen_clasificacion === OrigenClasificacion.MODELO).length,
      adhesiones: filas.reduce((acc, r) => acc + r.adhesiones_count, 0),
    }),
    [filas],
  );
  const visibles = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return q ? filas.filter((r) => r.titulo.toLowerCase().includes(q)) : filas;
  }, [filas, texto]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Inbox className="size-6" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Bandeja de reclamos
            </h1>
            <p className="text-sm text-muted-foreground">
              Reclamos entrantes pendientes de clasificar, mas recientes primero.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={reload} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : undefined} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Entrantes" value={kpis.entrantes} icon={Inbox} tono="azul" />
        <KpiCard
          label="Recibidos"
          value={kpis.recibidos}
          hint="sin clasificar"
          icon={ClipboardList}
          tono="ambar"
        />
        <KpiCard label="En revision" value={kpis.enRevision} icon={Eye} tono="azul" />
        <KpiCard
          label="Clasificados por IA"
          value={kpis.ia}
          hint={`${kpis.adhesiones} adhesiones en total`}
          icon={Sparkles}
          tono="verde"
        />
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por titulo..."
              className="pl-9"
              aria-label="Buscar en la bandeja"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {visibles.length} {visibles.length === 1 ? "reclamo" : "reclamos"}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Cargando bandeja...
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
              <RefreshCw />
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && visibles.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Inbox className="size-6" />
            </span>
            <p className="font-medium">Bandeja al dia</p>
            <p className="text-sm text-muted-foreground">
              No hay reclamos entrantes que coincidan.
            </p>
          </div>
        )}

        {!loading && !error && visibles.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Reclamo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Adhesiones</TableHead>
                  <TableHead>Ingreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => navigate(`/reclamos/${r.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <p className="font-medium">{r.titulo}</p>
                      <p className="font-mono text-xs text-muted-foreground">{idCorto(r.id)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <CategoriaBadge categoria={r.categoria} />
                        {r.origen_clasificacion === OrigenClasificacion.MODELO && <IaBadge />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PrioridadBadge prioridad={r.prioridad} />
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={r.estado} />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Users className="size-3.5 text-muted-foreground" />
                        {r.adhesiones_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {haceCuanto(r.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
