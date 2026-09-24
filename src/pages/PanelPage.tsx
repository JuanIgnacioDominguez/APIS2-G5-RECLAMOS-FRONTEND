import { Clock, Inbox, Loader2 } from "lucide-react";

import { EstadoError } from "@/components/EstadoError";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { estadisticas } from "@/api/reclamos";
import type { ConteoPorClave } from "@/api/types";
import { useAsync } from "@/hooks/useAsync";

function Distribucion({ titulo, datos }: { titulo: string; datos: ConteoPorClave[] }) {
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
              <span>{d.clave}</span>
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
  const { data, loading, error, reload } = useAsync(() => estadisticas(), []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return <EstadoError mensaje={error ?? "Sin datos"} onReintentar={reload} />;
  }

  const horas = data.tiempo_resolucion_horas_promedio;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Panel de metricas" descripcion="Resumen del modulo de reclamos." />

      <div data-tour="panel-kpis" className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Total de reclamos" value={data.total} icon={Inbox} tono="azul" />
        <KpiCard
          label="Tiempo de resolucion promedio"
          value={horas === null ? "-" : `${horas.toFixed(1)} h`}
          icon={Clock}
          tono="verde"
        />
      </div>

      <div data-tour="panel-distribuciones" className="grid gap-4 md:grid-cols-3">
        <Distribucion titulo="Por estado" datos={data.por_estado} />
        <Distribucion titulo="Por categoria" datos={data.por_categoria} />
        <Distribucion titulo="Por prioridad" datos={data.por_prioridad} />
      </div>
    </div>
  );
}
