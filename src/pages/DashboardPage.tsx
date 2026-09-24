import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CircleCheckBig,
  Clock3,
  FileText,
  Flag,
  Inbox,
  Loader2,
  MapPin,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import type { Page, ReclamoResumen } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { Rol } from "@/auth/roles";
import { EstadoError } from "@/components/EstadoError";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoReclamo } from "@/domain/enums";
import {
  cantidadPorEstado,
  resumenDesdeEstadisticas,
  resumenDesdeReclamos,
  type DistribucionDashboard,
  type ResumenDashboard,
} from "@/features/dashboardMetrics";
import { DashboardMapaReclamos } from "@/features/mapa/DashboardHeatMap";
import { reclamosUbicados } from "@/features/mapa/coords";
import { CategoriaLinea, EstadoBadge, PrioridadBadge } from "@/features/reclamos/EstadoBadges";
import {
  useContarResueltosQuery,
  useEstadisticasQuery,
  useListarReclamosQuery,
} from "@/store/citypassApi";
import { haceCuanto, idCorto } from "@/lib/format";

type TonoIndicador = "azul" | "ambar" | "verde" | "neutro";

interface Indicador {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tono: TonoIndicador;
}

const TONOS: Record<TonoIndicador, string> = {
  azul: "bg-chart-1/10 text-chart-1",
  ambar: "bg-chart-3/15 text-chart-3",
  verde: "bg-chart-2/12 text-chart-2",
  neutro: "bg-chart-5/10 text-chart-5",
};

function porcentaje(valor: number): string {
  return `${Number.isInteger(valor) ? valor : valor.toFixed(1)}%`;
}

function formatHoras(horas: number): string {
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(horas)} h`;
}

function crearIndicadores({
  resumen,
  items,
  datosGlobales,
  tiempoResolucion,
  resueltos,
}: {
  resumen: ResumenDashboard;
  items: ReclamoResumen[];
  datosGlobales: boolean;
  tiempoResolucion: number | null;
  resueltos: number;
}): Indicador[] {
  const pendientes =
    cantidadPorEstado(resumen, EstadoReclamo.RECIBIDO) +
    cantidadPorEstado(resumen, EstadoReclamo.EN_REVISION);
  const cuartoIndicador: Indicador = datosGlobales
    ? {
        label: "Tiempo histórico de resolución",
        value: tiempoResolucion === null ? "Sin datos" : formatHoras(tiempoResolucion),
        hint: "hasta la primera resolución",
        icon: Clock3,
        tono: "neutro",
      }
    : {
        label: "Reclamos geolocalizados",
        value: reclamosUbicados(items).length,
        hint: "de la muestra reciente",
        icon: MapPin,
        tono: "neutro",
      };

  return [
    {
      label: datosGlobales ? "Reclamos totales" : "Reclamos recientes",
      value: resumen.total,
      hint: datosGlobales ? "acumulado histórico" : "en la muestra cargada",
      icon: Inbox,
      tono: "azul",
    },
    {
      label: "Pendientes de asignación",
      value: pendientes,
      hint: "recibidos o en revisión",
      icon: Clock3,
      tono: "ambar",
    },
    {
      label: "Resueltos",
      value: resueltos,
      hint: "resueltos o cerrados",
      icon: CircleCheckBig,
      tono: "verde",
    },
    cuartoIndicador,
  ];
}

function IndicadorTarjeta({ indicador }: { indicador: Indicador }) {
  const Icono = indicador.icon;
  return (
    <Card className="py-3 transition-shadow hover:shadow-md">
      <CardContent className="flex min-h-24 items-center gap-3.5">
        <div
          aria-hidden="true"
          className={`grid size-12 shrink-0 place-items-center rounded-xl ${TONOS[indicador.tono]}`}
        >
          <Icono className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{indicador.label}</p>
          <p className="mt-1 text-[1.7rem] font-semibold leading-none tracking-tight tabular-nums">
            {indicador.value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{indicador.hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TituloPanel({
  icon: Icono,
  titulo,
  descripcion,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
}) {
  return (
    <>
      <CardTitle className="flex items-center gap-2.5 font-semibold">
        <span className="text-chart-1">
          <Icono className="size-5" />
        </span>
        {titulo}
      </CardTitle>
      <CardDescription className="pl-9">{descripcion}</CardDescription>
    </>
  );
}

function FilaDistribucion({ distribucion }: { distribucion: DistribucionDashboard }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_minmax(5rem,1fr)_3.25rem] items-center gap-3 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: distribucion.color }}
        />
        <span className="truncate">{distribucion.etiqueta}</span>
      </span>
      <span className="text-right font-medium tabular-nums">{distribucion.cantidad}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full transition-[width]"
          style={{ width: `${distribucion.porcentaje}%`, backgroundColor: distribucion.color }}
        />
      </span>
      <span className="text-right tabular-nums text-muted-foreground">
        {porcentaje(distribucion.porcentaje)}
      </span>
    </div>
  );
}

function PanelEstados({
  resumen,
  datosGlobales,
}: {
  resumen: ResumenDashboard;
  datosGlobales: boolean;
}) {
  return (
    <Card className="min-w-0 xl:col-span-8">
      <CardHeader>
        <TituloPanel
          icon={BarChart3}
          titulo="Estado actual de los reclamos"
          descripcion={
            datosGlobales
              ? "Distribución global de todos los reclamos registrados."
              : "Distribución dentro de los reclamos recientes cargados."
          }
        />
      </CardHeader>
      <CardContent className="space-y-3.5">
        {resumen.total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Todavia no hay reclamos para mostrar.
          </p>
        ) : (
          resumen.por_estado.map((distribucion) => (
            <FilaDistribucion key={distribucion.clave} distribucion={distribucion} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PanelCategorias({
  resumen,
  datosGlobales,
}: {
  resumen: ResumenDashboard;
  datosGlobales: boolean;
}) {
  const circunferencia = 2 * Math.PI * 45;
  const categorias = resumen.por_categoria.filter((categoria) => categoria.cantidad > 0);

  return (
    <Card className="min-w-0 xl:col-span-4">
      <CardHeader>
        <TituloPanel
          icon={BarChart3}
          titulo="Reclamos por categoría"
          descripcion={
            datosGlobales
              ? "Distribución global según categoría."
              : "Distribución de la muestra reciente."
          }
        />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-5 min-[430px]:flex-row">
        {resumen.total === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Todavia no hay reclamos para mostrar.
          </p>
        ) : (
          <>
            <div className="relative grid size-40 shrink-0 place-items-center">
              <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden="true">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  strokeWidth="14"
                  className="stroke-muted"
                />
                {categorias.map((categoria, index) => {
                  const offset = categorias
                    .slice(0, index)
                    .reduce((total, item) => total + item.porcentaje, 0);
                  const longitud = (categoria.porcentaje / 100) * circunferencia;
                  return (
                    <circle
                      key={categoria.clave}
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      strokeWidth="14"
                      strokeDasharray={`${longitud} ${circunferencia - longitud}`}
                      strokeDashoffset={-(offset / 100) * circunferencia}
                      transform="rotate(-90 60 60)"
                      style={{ stroke: categoria.color }}
                    />
                  );
                })}
              </svg>
              <div className="relative text-center">
                <p className="text-xl font-semibold tracking-tight tabular-nums">{resumen.total}</p>
                <p className="text-xs text-muted-foreground">reclamos</p>
              </div>
            </div>
            <div className="w-full max-w-64 space-y-2.5">
              {categorias.map((categoria) => (
                <div
                  key={categoria.clave}
                  className="grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem] items-center gap-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: categoria.color }}
                    />
                    <span className="truncate">{categoria.etiqueta}</span>
                  </span>
                  <span className="text-right font-medium tabular-nums">
                    {porcentaje(categoria.porcentaje)}
                  </span>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {categoria.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PanelPrioridades({
  resumen,
  datosGlobales,
}: {
  resumen: ResumenDashboard;
  datosGlobales: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <TituloPanel
          icon={Flag}
          titulo="Prioridades"
          descripcion={
            datosGlobales
              ? "Distribución global por prioridad."
              : "Distribución de la muestra reciente."
          }
        />
      </CardHeader>
      <CardContent className="space-y-3.5">
        {resumen.total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Sin datos.</p>
        ) : (
          resumen.por_prioridad.map((distribucion) => (
            <FilaDistribucion key={distribucion.clave} distribucion={distribucion} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PanelMapa({
  data,
  loading,
  error,
  onReintentar,
}: {
  data: Page<ReclamoResumen> | null;
  loading: boolean;
  error: string | null;
  onReintentar: () => void;
}) {
  return (
    <Card className="min-w-0 xl:col-span-8">
      <CardHeader>
        <TituloPanel
          icon={MapPin}
          titulo="Mapa de reclamos geolocalizados"
          descripcion="Ubicaciones registradas en los reclamos recientes."
        />
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : error && !data ? (
          <EstadoError mensaje={error} onReintentar={onReintentar} />
        ) : data ? (
          <DashboardMapaReclamos reclamos={data.items} total={data.total} />
        ) : null}
      </CardContent>
    </Card>
  );
}

function PanelUltimosReclamos({
  data,
  loading,
  error,
  onReintentar,
}: {
  data: Page<ReclamoResumen> | null;
  loading: boolean;
  error: string | null;
  onReintentar: () => void;
}) {
  const reclamos = data?.items.slice(0, 5) ?? [];

  return (
    <Card className="min-w-0">
      <CardHeader>
        <TituloPanel
          icon={FileText}
          titulo="Últimos reclamos"
          descripcion="Reclamos ordenados por fecha de ingreso."
        />
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to="/reclamos">
              Ver todos
              <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {loading && !data ? (
          <div className="space-y-3 px-4 pb-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : error && !data ? (
          <EstadoError mensaje={error} onReintentar={onReintentar} />
        ) : reclamos.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Todavia no hay reclamos registrados.
          </p>
        ) : (
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Reclamo
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Categoría
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Barrio
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Estado
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Prioridad
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Ingreso
                </TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reclamos.map((reclamo) => (
                <TableRow key={reclamo.id}>
                  <TableCell className="max-w-64 pl-5">
                    <Link
                      to={`/reclamos/${reclamo.id}`}
                      state={{ origen: { label: "Dashboard", to: "/dashboard" } }}
                      className="block"
                    >
                      <span className="block truncate font-medium text-primary hover:underline">
                        {reclamo.titulo}
                      </span>
                      <span className="text-xs text-muted-foreground">{idCorto(reclamo.id)}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <CategoriaLinea categoria={reclamo.categoria} />
                  </TableCell>
                  <TableCell>{reclamo.barrio ?? "Sin barrio"}</TableCell>
                  <TableCell>
                    <EstadoBadge estado={reclamo.estado} />
                  </TableCell>
                  <TableCell>
                    <PrioridadBadge prioridad={reclamo.prioridad} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {haceCuanto(reclamo.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/reclamos/${reclamo.id}`}
                      state={{ origen: { label: "Dashboard", to: "/dashboard" } }}
                      aria-label={`Ver ${reclamo.titulo}`}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardCargando() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 rounded-xl xl:col-span-8" />
        <Skeleton className="h-80 rounded-xl xl:col-span-4" />
      </div>
    </div>
  );
}

function errorMessage(err: unknown): string | null {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return null;
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === Rol.ADMIN;
  const recientes = useListarReclamosQuery({
    orden: "recientes",
    size: 100,
    usuario_cache: usuario?.id,
  });
  const metricasGlobales = useEstadisticasQuery(undefined, { skip: !esAdmin });
  const resueltosGlobal = useContarResueltosQuery(undefined, { skip: esAdmin });

  const resumenGlobal = useMemo(
    () => (metricasGlobales.data ? resumenDesdeEstadisticas(metricasGlobales.data) : null),
    [metricasGlobales.data],
  );
  const resumenMuestra = useMemo(
    () => (recientes.data ? resumenDesdeReclamos(recientes.data.items) : null),
    [recientes.data],
  );
  const datosGlobales = esAdmin && resumenGlobal !== null;
  const resumen = datosGlobales ? resumenGlobal : resumenMuestra;
  const items = recientes.data?.items ?? [];
  const errorRecientes = errorMessage(recientes.error);
  const errorMetricas = errorMessage(metricasGlobales.error);
  const esperandoGlobal = esAdmin && metricasGlobales.isLoading && errorRecientes === null;

  const recargar = () => {
    recientes.refetch();
    if (esAdmin) metricasGlobales.refetch();
    else resueltosGlobal.refetch();
  };

  if (!resumen || esperandoGlobal) {
    if (recientes.isLoading || metricasGlobales.isLoading) return <DashboardCargando />;
    return (
      <EstadoError
        mensaje={errorRecientes ?? errorMetricas ?? "Sin datos disponibles"}
        onReintentar={recargar}
      />
    );
  }

  const resueltosResumen =
    cantidadPorEstado(resumen, EstadoReclamo.RESUELTO) +
    cantidadPorEstado(resumen, EstadoReclamo.CERRADO);
  const indicadores = crearIndicadores({
    resumen,
    items,
    datosGlobales,
    tiempoResolucion: metricasGlobales.data?.tiempo_resolucion_horas_promedio ?? null,
    resueltos: resueltosGlobal.data ?? resueltosResumen,
  });
  const actualizando =
    recientes.isFetching || resueltosGlobal.isFetching || (esAdmin && metricasGlobales.isFetching);
  const actualizar = recargar;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:gap-4">
      <PageHeader
        titulo="Dashboard"
        descripcion={
          datosGlobales
            ? "Resumen general de reclamos y actividad municipal."
            : "Actividad de los reclamos recientes cargados para operar la bandeja."
        }
        accion={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-8 bg-card px-3">
              {datosGlobales ? "Datos globales" : "Muestra reciente"}
            </Badge>
            <Button variant="outline" onClick={actualizar} disabled={actualizando} className="h-10">
              {actualizando ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Actualizar
            </Button>
          </div>
        }
      />

      {esAdmin && metricasGlobales.error && (
        <div
          role="status"
          className="rounded-lg border border-chart-3/30 bg-chart-3/10 px-4 py-3 text-sm text-chart-3"
        >
          No se pudieron cargar las estadisticas globales. Se muestran los datos de los reclamos
          recientes.
        </div>
      )}

      <section
        aria-label="Indicadores principales"
        data-tour="dashboard-kpis"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {indicadores.map((indicador) => (
          <IndicadorTarjeta key={indicador.label} indicador={indicador} />
        ))}
      </section>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-12">
        <PanelEstados resumen={resumen} datosGlobales={datosGlobales} />
        <PanelCategorias resumen={resumen} datosGlobales={datosGlobales} />
      </div>

      <div data-tour="dashboard-heatmap" className="grid gap-3 sm:gap-4 xl:grid-cols-12">
        <PanelMapa
          data={recientes.data ?? null}
          loading={recientes.isLoading}
          error={errorRecientes}
          onReintentar={() => void recientes.refetch()}
        />
        <div className="xl:col-span-4">
          <PanelPrioridades resumen={resumen} datosGlobales={datosGlobales} />
        </div>
      </div>

      <div data-tour="dashboard-recientes">
        <PanelUltimosReclamos
          data={recientes.data ?? null}
          loading={recientes.isLoading}
          error={errorRecientes}
          onReintentar={() => void recientes.refetch()}
        />
      </div>
    </div>
  );
}
