import { useMemo } from "react";
import { CheckCircle2, ClipboardList, Eye, Inbox, RefreshCw, Sparkles } from "lucide-react";

import { bandeja, contarResueltos } from "@/api/reclamos";
import { useAsync } from "@/hooks/useAsync";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { TablaBandeja } from "@/features/reclamos/TablaBandeja";
import { calcularKpisBandeja } from "@/features/reclamos/bandejaTable";

/**
 * Backoffice inbox for operators and admins (US-13). Reads `/reclamos/bandeja`
 * (incoming claims, newest first) and tops it with queue KPIs plus the global
 * resolved-and-closed total, so staff see the shape of the work at a glance.
 */
export function BandejaPage() {
  const { data, loading, error, reload } = useAsync(() => bandeja(), []);
  const resueltos = useAsync(() => contarResueltos(), []);

  const filas = useMemo(() => data?.items ?? [], [data]);
  const kpis = useMemo(() => calcularKpisBandeja(filas, data?.total), [data?.total, filas]);
  const actualizando = loading || resueltos.loading;
  const refrescar = () => {
    reload();
    resueltos.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <div data-tour="bandeja-header" className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Bandeja de reclamos
            </h1>
            <p className="text-sm text-muted-foreground">
              Reclamos entrantes pendientes de clasificar, mas recientes primero.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={refrescar} disabled={actualizando}>
          <RefreshCw className={actualizando ? "animate-spin" : undefined} />
          Actualizar
        </Button>
      </div>

      <div
        data-tour="bandeja-kpis"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        <KpiCard label="Entrantes" value={kpis.entrantes} icon={Inbox} tono="azul" />
        <KpiCard
          label="Recibidos"
          value={kpis.recibidos}
          hint="sin clasificar"
          icon={ClipboardList}
          tono="ambar"
        />
        <KpiCard label="En revision" value={kpis.enRevision} icon={Eye} tono="azul" />
        <KpiCard label="Resueltos" value={resueltos.data ?? "–"} icon={CheckCircle2} tono="verde" />
        <KpiCard
          label="Clasificados por IA"
          value={kpis.clasificadosIa}
          hint={`${kpis.adhesiones} adhesiones en total`}
          icon={Sparkles}
          tono="verde"
        />
      </div>

      <div data-tour="bandeja-tabla">
        <TablaBandeja filas={filas} loading={loading} error={error} onRefresh={refrescar} />
      </div>
    </div>
  );
}
