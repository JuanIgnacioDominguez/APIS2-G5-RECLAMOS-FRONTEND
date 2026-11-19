import { Clock, Inbox, Loader2 } from "lucide-react";

import { EstadoError } from "@/components/EstadoError";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ConteoPorClave } from "@/api/types";
import { CATEGORIA_LABEL, ESTADO_LABEL, PRIORIDAD_LABEL } from "@/domain/labels";
import { useEstadisticasQuery } from "@/store/citypassApi";

function Distribucion({
  titulo,
  datos,
  etiquetas,
}: {
  titulo: string;
  datos: ConteoPorClave[];
  etiquetas: Readonly<Record<string, string>>;
}) {
  const total = datos.reduce((acc, d) => acc + d.cantidad, 0) || 1;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {datos.length === 0 && <p className="text-sm text-muted-foreground">Sin datos.</p>}
        {datos.map((d) => (
          <div key={d.clave} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              {/* The API sends raw enum codes; fall back to the code for unknown values. */}
              <span>{etiquetas[d.clave] ?? d.clave}</span>
              <span className="font-semibold tabular-nums">{d.cantidad}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(d.cantidad / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Admin-only metrics panel. Feeds off the module's `GET /reclamos/estadisticas`
 * (the same endpoint that serves Group 8's Urban Analytics).
 */
export function PanelPage() {
  const { data, isLoading, error, refetch } = useEstadisticasQuery();
  const mensajeError =
    error && "message" in error && typeof error.message === "string" ? error.message : null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return <EstadoError mensaje={mensajeError ?? "Sin datos"} onReintentar={refetch} />;
  }

  const horas = data.tiempo_resolucion_horas_promedio;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Panel de métricas" descripcion="Resumen del módulo de reclamos." />

      <div data-tour="panel-kpis" className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Total de reclamos" value={data.total} icon={Inbox} tono="azul" />
        <KpiCard
          label="Tiempo de resolución promedio"
          value={horas === null ? "-" : `${horas.toFixed(1)} h`}
          icon={Clock}
          tono="verde"
        />
      </div>

      <div data-tour="panel-distribuciones" className="grid gap-4 md:grid-cols-3">
        <Distribucion titulo="Por estado" datos={data.por_estado} etiquetas={ESTADO_LABEL} />
        <Distribucion
          titulo="Por categoría"
          datos={data.por_categoria}
          etiquetas={CATEGORIA_LABEL}
        />
        <Distribucion
          titulo="Por prioridad"
          datos={data.por_prioridad}
          etiquetas={PRIORIDAD_LABEL}
        />
      </div>
    </div>
  );
}
